import _some from 'lodash/some'
import _find from 'lodash/find'
import _isEmpty from 'lodash/isEmpty'
import { Gender, Parent, Relationship, Relatives } from '../enums'
import { GetRelativesProps, Person } from '../types'
import {
    Messages,
    filterSiblingsByGender,
    filterSiblingsByPartner,
    getRelationshipNames,
    isMemberSpouse,
    isMother
} from '../utils'
import Family from './Family'

class RelationshipHandler {
    family: Family

    constructor(family: Family) {
        this.family = family
    }

    /**
     * Gets the relationship of a person in the family.
     *
     * @param name - The name of the person.
     * @param relationship - The type of relationship to find.
     * @returns An array of names of people who have the specified relationship with the person, or an error message if the person is not found or the relationship is not handled.
     */
    findRelationship(name: string, relationship: Relationship): string[] | string {
        const person = this.family.findMember(name)
        if (!person) {
            return Messages.PERSON_NOT_FOUND
        }

        // Get the function for the specified relationship
        const relationshipFunctions: Record<Relationship, () => Person[]> = {
            [Relationship.Siblings]: () => this.getSiblings(person, name),
            [Relationship.SisterInLaw]: () => this.getSisterInLaw(person, name),
            [Relationship.BrotherInLaw]: () => this.getBrotherInLaw(person, name),
            [Relationship.PaternalUncle]: () =>
                this.getRelatives({ name, familyMember: person, relative: Relatives.Uncle, parent: Parent.Father }),
            [Relationship.PaternalAunt]: () =>
                this.getRelatives({ name, familyMember: person, relative: Relatives.Aunt, parent: Parent.Father }),
            [Relationship.MaternalUncle]: () =>
                this.getRelatives({ name, familyMember: person, relative: Relatives.Uncle, parent: Parent.Mother }),
            [Relationship.MaternalAunt]: () =>
                this.getRelatives({ name, familyMember: person, relative: Relatives.Aunt, parent: Parent.Mother }),
            [Relationship.Son]: () => this.getSons(person),
            [Relationship.Daughter]: () => this.getDaughters(person)
        }

        const relationshipFunction = relationshipFunctions[relationship]
        if (!relationshipFunction) {
            return Messages.RELATIONSHIP_NOT_HANDLED
        }

        return getRelationshipNames(relationshipFunction)
    }

    /**
     * Finds the in-laws of a family member based on the specified partner name and relationship key.
     * @param member - The family member.
     * @param partnerName - The name of the partner.
     * @param partnerKey - The key representing the partner relationship ('spouse' or 'husband').
     * @param getSpouseSiblings - Function to retrieve spouse's siblings.
     * @param getSiblingPartners - Function to retrieve sibling partners.
     * @returns An array of in-law family members.
     */
    findInlaws(
        member: Person,
        partnerName: string,
        partnerKey: 'spouse' | 'husband',
        getSpouseSiblings: (siblings: Person[]) => Person[],
        getSiblingPartners: (siblings: Person[]) => Person[]
    ): Person[] {
        const inLaws: Person[] = []
        let memberSiblings: Person[] = []

        // Get spouse's siblings
        memberSiblings = this.findSiblings(member.mother)
        const spouseInLaws = getSpouseSiblings(memberSiblings).filter((sibling) => sibling.name !== member.name)
        inLaws.push(...spouseInLaws)

        // console.log('memberSiblings', memberSiblings)
        // Get member's siblings' partners
        if (memberSiblings.length > 0) {
            const siblingsInLaws = getSiblingPartners(memberSiblings)
                .filter((sibling) => sibling.name !== member.name)
                .map((sibling) => {
                    return {
                        ...sibling,
                        name: sibling[partnerKey] as string
                    }
                })
            // console.log('siblingsInLaws', siblingsInLaws)
            inLaws.push(...siblingsInLaws)
        }

        // console.log('inLaws', inLaws)
        return inLaws
    }

    findSiblings(parentName: string): Person[] {
        const parent = this.family.findMember(parentName)

        return parent?.children || []
    }

    // TODO: improve condition handling here!
    findMother(motherName: string): Person | string {
        const familyMembers = this.family.getFamilyMembers()
        const mother = this.family.findMember(motherName, familyMembers)
        const isHusband = mother?.husband ?? ''
        let message = Messages.CHILD_ADDITION_FAILED
        if (!mother) {
            return Messages.PERSON_NOT_FOUND
        }
        if ((motherName === mother.name && mother.gender === Gender.Male) || isHusband === motherName) {
            return Messages.CHILD_ADDITION_FAILED
        }
        // additional check to make sure its a mother
        if (isMother(mother, motherName) || isMemberSpouse(mother, motherName)) {
            return mother
        }

        return message
    }

    getSiblings(member: Person, name: string) {
        // note: we need to check for all the siblings here and make sure that the name exists on the siblings list if not it means
        // the name here is not a true sibling, either its the member partner and we return empty
        const memberSiblings = this.findSiblings(member['mother'])
        const isSibling = _find(memberSiblings, ['name', name])
        if (!isSibling) {
            return []
        }
        return memberSiblings.filter((child) => child.name && child.name !== name)
    }

    /**
     * Retrieves the relatives of a person based on the specified relationship and parent type.
     *
     * @param {GetRelativesProps} props - The properties needed to find the relatives.
     * @param {Person} props.person - The person for whom relatives are to be found.
     * @param {Relatives} props.relative - The type of relative to find (e.g., Uncle, Aunt).
     * @param {ParentType} props.parent - The parent type (Mother or Father) to use for finding relatives.
     * @returns {Person[]} An array of relatives of the specified type, or an empty array if none are found.
     */
    getRelatives({ familyMember: person, relative, parent }: GetRelativesProps): Person[] {
        let relatives: Person[] = []
        // check first ther person and continue only if has parent
        if (!person?.[parent]) {
            return relatives
        }
        // find the parent of the person
        const personParent = this.family.findMember(person[parent] as string)
        //if person parent is the same name it means it was the husband or spouse of the parent  meaning chances has no relatives
        if (person[parent] === personParent?.husband || person[parent] === personParent?.spouse) {
            return relatives
        }
        // Get the siblings of the person's parent
        // Filter out the person's parent from the list of siblings
        const parentSiblings = this.findSiblings(personParent?.[parent] as string).filter(
            (sibling) => sibling.name !== person[parent]
        )
        // Filter the parent's siblings based on the specified relative type
        // If looking for an Aunt, filter by female gender; otherwise, filter by male gender
        relatives = parentSiblings.filter(
            (sibling) => sibling.gender === (relative === Relatives.Aunt ? Gender.Female : Gender.Male)
        )

        return relatives
    }

    // Specific functions to find sisters-in-law and brothers-in-law
    getSisterInLaw(member: Person, partnerName: string): Person[] {
        return this.findInlaws(
            member,
            partnerName,
            'spouse',
            (siblings) => filterSiblingsByGender(siblings, Gender.Female),
            (siblings) => filterSiblingsByPartner(siblings, Gender.Male, 'spouse')
        )
    }

    getBrotherInLaw(member: Person, spouseName: string): Person[] {
        return this.findInlaws(
            member,
            spouseName,
            'husband',
            (siblings) => filterSiblingsByGender(siblings, Gender.Male),
            (siblings) => filterSiblingsByPartner(siblings, Gender.Female, 'husband')
        )
    }

    getSons(person: Person): Person[] {
        if (!person.children) {
            return []
        }

        return person.children.filter((child) => child.gender === Gender.Male)
    }

    getDaughters(person: Person): Person[] {
        if (!person.children) {
            return []
        }

        return person.children.filter((child) => child.gender === Gender.Female)
    }
}

export default RelationshipHandler

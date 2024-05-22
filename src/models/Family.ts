import _some from 'lodash/some'
import { Gender, Parent, Relationship, Relatives } from '../enums'
import { AddChildProps, GetRelativesProps, ParentType, Person } from '../types'
import { Messages } from '../utils/messages'

class Family {
  members: Person[]

  constructor(members: Person[]) {
    this.members = members
  }

  addMember(person: Person) {
    this.members.push(person)
  }

  findMember(name: string, members: Person[] = this.members): Person | undefined {
    for (const person of members) {
      // Use lodash's _.some function to check if any of the person's properties match the name
      if (_some(person, (v) => v === name)) {
        return person
      }

      // If the person has children, recursively call findMember on the children
      // to find the person
      if (person.children) {
        const result = this.findMember(name, person.children)
        if (result) {
          return result
        }
      }
    }

    return undefined
  }

  /**
   * Adds a child to the family.
   *
   * @param motherName - The name of the mother.
   * @param fatherName - The name of the father.
   * @param childName - The name of the child to be added.
   * @param gender - The gender of the child.
   * @returns The updated Family object if the child was successfully added, or an error message if the mother is not a member of the family.
   */
  addChild({ motherName, fatherName, childName, gender }: AddChildProps): Family | string {
    // Check if the mother is a member of the family
    const isFamilyMember = this.findMember(motherName)

    // If the mother is not a member of the family, return an error message
    if (!isFamilyMember) {
      return Messages.PERSON_NOT_FOUND
    }

    // Create a new child object
    const child = {
      name: childName,
      gender,
      mother: motherName,
      father: fatherName,
      children: []
    }

    // Add the child to the family
    this.addMember(child)

    // Return the updated Family object
    return this
  }

  // Get the names of people who have the specified relationship with the person
  getRelationshipNames(person: Person, relationshipFunction: (person: Person) => Person[]): string[] {
    return relationshipFunction(person).map((relative) => relative.name)
  }

  /**
   * Gets the relationship of a person in the family.
   *
   * @param name - The name of the person.
   * @param relationship - The type of relationship to find.
   * @returns An array of names of people who have the specified relationship with the person, or an error message if the person is not found or the relationship is not handled.
   */
  getRelationship(name: string, relationship: Relationship): string[] | string {
    const person = this.findMember(name)
    if (!person) {
      return Messages.PERSON_NOT_FOUND
    }

    // Get the function for the specified relationship
    const relationshipFunctions: Record<Relationship, (person: Person) => Person[]> = {
      [Relationship.Siblings]: (person: Person) =>
        this.getSiblings(person['mother'] as unknown as Person).filter((child) => child.name !== person.name), // TODO: improve typings
      [Relationship.SisterInLaw]: (person: Person) => this.getInLaws(person, Gender.Male),
      [Relationship.BrotherInLaw]: (person: Person) => this.getInLaws(person, Gender.Female),
      [Relationship.PaternalUncle]: (person: Person) =>
        this.getRelatives({ person, relative: Relatives.Uncle, parent: Parent.Father }),
      [Relationship.PaternalAunt]: (person: Person) =>
        this.getRelatives({ person, relative: Relatives.Aunt, parent: Parent.Father }),
      [Relationship.MaternalUncle]: (person: Person) =>
        this.getRelatives({ person, relative: Relatives.Uncle, parent: Parent.Mother }),
      [Relationship.MaternalAunt]: (person: Person) =>
        this.getRelatives({ person, relative: Relatives.Aunt, parent: Parent.Mother }),
      [Relationship.Son]: this.getSons,
      [Relationship.Daughter]: this.getDaughters
    }

    const relationshipFunction = relationshipFunctions[relationship]
    if (!relationshipFunction) {
      return Messages.RELATIONSHIP_NOT_HANDLED
    }

    return this.getRelationshipNames(person, relationshipFunction)
  }

  getSiblings(person: Person): Person[] {
    const member = this.findMember(person as unknown as string) // TODO: improve typings
    const siblings = member?.children?.filter((child) => child.name !== person.name)
    return siblings || []
  }

  getInLaws(person: Person, gender: Gender = Gender.Male, parent: ParentType = Parent.Mother): Person[] {
    let inLaws: Person[] = []

    const siblings: Person[] = this.getSiblings(person[parent] as unknown as Person)

    siblings.forEach((sibling: Person) => {
      if (sibling.gender === gender && (sibling.spouse || sibling.husband)) {
        inLaws.push({
          ...sibling,
          name: (sibling.spouse as unknown as string) || (sibling.husband as unknown as string)
        })
      }
    })

    return inLaws
  }

  getSisterInLaws(person: Person): Person[] {
    const siblingsWives = this.getInLaws(person, Gender.Male, Parent.Mother)
    // TODO  find  spouse’s sisters and merge to sibling’s wives
    const spouseSisters = [] as Person[]
    return [...siblingsWives, ...spouseSisters]
  }

  getBrotherInLaws(person: Person): Person[] {
    const siblingsHusband = this.getInLaws(person, Gender.Female, Parent.Father)
    // TODO  find  spouse’s brother and merge to sibling’s husband
    const spouseBrother = [] as Person[]
    return [...siblingsHusband, ...spouseBrother]
  }

  getRelatives({ person, relative, parent }: GetRelativesProps): Person[] {
    if (!person[parent]) {
      return []
    }

    // find the parent of the person first
    const personParent = this.findMember(person[parent] as unknown as string) as Person

    // remove the person parent from the list of siblings
    const parentSiblings = this.getSiblings(personParent[parent] as unknown as Person).filter(
      (sibling) => sibling.name !== (person[parent] as unknown as string)
    )

    // filter based on relation
    const relatives = parentSiblings.filter(
      (sibling) => sibling.gender === (relative === Relatives.Aunt ? Gender.Female : Gender.Male)
    )
    return relatives
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

export default Family

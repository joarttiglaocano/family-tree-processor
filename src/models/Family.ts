import _some from 'lodash/some'
import _find from 'lodash/find'
import _isEmpty from 'lodash/isEmpty'
import { AddChildProps, Person } from '../types'
import { Messages } from '../utils'
import { Relationship } from '../enums'
import RelationshipHandler from './RelationshipHandler'

class Family {
    private members: Person[]
    relationshipHandler: RelationshipHandler

    constructor(members: Person[]) {
        this.members = members
        this.relationshipHandler = new RelationshipHandler(this)
    }

    // note: for now updating of family is based only on adding a child from mother within the family update if necessary
    private updateFamily(mother: Person, child: Person) {
        mother?.children?.push(child)
    }

    /**
     * Finds a member in the family tree based on the specified name.
     * @param name - The name of the member to find.
     * @param members - The list of family members to search within.
     * @param keysToCheck - The keys of the member object to check for name matching.
     * @returns The matching member object if found, otherwise undefined.
     */
    findMember(
        name: string,
        members: Person[] = this.members,
        keysToCheck: string[] = ['name', 'husband', 'spouse']
    ): Person | undefined {
        for (const person of members) {
            // Use lodash's _.some function to check if any of the person's properties match the name
            if (_some(keysToCheck, (key) => person[key as keyof Person] === name)) {
                return person
            }

            // If the person has children, recursively call findMember on the children until member is found
            if (person.children) {
                const result = this.findMember(name, person.children)
                if (result) {
                    return result
                }
            }
        }
    }

    /**
     * Adds a child to the family.
     *
     * @param motherName - The name of the mother.
     * @param childName - The name of the child to be added.
     * @param gender - The gender of the child.
     * @returns The updated Family object if the child was successfully added, or an error message if the mother is not a member of the family.
     */
    addChild({ motherName, childName, gender }: AddChildProps): string {
        // Find the mother
        const mother: Person | string = this.relationshipHandler.findMother(motherName)

        // Should check if its mother and type of person, if not no need to proceed process
        if (mother && typeof mother !== 'object') {
            return mother as string
        }

        // Once the mother was found create the child object
        const child: Person = {
            name: childName,
            gender,
            mother: motherName,
            children: []
        }

        this.updateFamily(mother as Person, child)

        return Messages.CHILD_ADDED
    }

    getFamilyMembers() {
        return this.members
    }

    getRelationship(name: string, relationship: Relationship): string[] | string {
        return this.relationshipHandler.findRelationship(name, relationship)
    }
}

export default Family

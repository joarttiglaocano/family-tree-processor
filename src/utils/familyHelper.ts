import { Gender } from '../enums'
import { Person } from '../types'

export function filterSiblingsByGender(siblings: Person[], gender: Gender): Person[] {
    return siblings.filter((sibling) => sibling.gender === gender)
}

// Dynamic helper function to filter siblings based on presence of spouse/husband
export function filterSiblingsByPartner(
    siblings: Person[],
    partnerGender: Gender,
    partnerKey: 'spouse' | 'husband'
): Person[] {
    return siblings.filter((sibling) => sibling.gender === partnerGender && sibling[partnerKey])
}

export function isMother(member: Person, motherName: string): boolean {
    const hasHusband = member.husband ?? false
    return member.name === motherName && hasHusband ? true : false
}
export function isMemberSpouse(member: Person, motherName: string): boolean {
    const memberSpouse = member?.spouse ?? ''
    return memberSpouse === motherName ?? false
}

export function getRelationshipNames(relationshipFunction: () => Person[]): string[] {
    return relationshipFunction().map((relative) => relative.name)
}

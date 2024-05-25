import { Gender } from '../enums'

export type Person = {
    name: string
    gender: Gender
    mother: string
    father?: string
    spouse?: string
    husband?: string
    children?: Person[]
}

export type Family = Person[]

export type GetRelativesProps = {
    name: string
    familyMember: Person
    relative: RelativeType
    parent: ParentType
}

export type RelativeType = 'aunt' | 'uncle'
export type ParentType = 'mother' | 'father'

export type AddChildProps = {
    motherName: string
    childName: string
    gender: Gender
}

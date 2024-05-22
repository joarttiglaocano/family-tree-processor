import { Gender } from '../enums'

export type Person = {
  name: string
  gender: Gender
  mother: string
  father?: string
  spouse?: Person
  husband?: Person
  children?: Person[]
}

export type Family = Person[]

export type GetRelativesProps = {
  person: Person
  relative: RelativeType
  parent: ParentType
}

export type RelativeType = 'aunt' | 'uncle'
export type ParentType = 'mother' | 'father'

export type AddChildProps = {
  family: Family
  motherName: string
  fatherName?: string
  childName: string
  gender: Gender
}

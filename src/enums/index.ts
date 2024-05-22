import { ParentType, RelativeType } from '../types'

export enum Relationship {
  PaternalUncle = 'Paternal-Uncle',
  MaternalUncle = 'Maternal-Uncle',
  PaternalAunt = 'Paternal-Aunt',
  MaternalAunt = 'Maternal-Aunt',
  SisterInLaw = 'Sister-In-Law',
  BrotherInLaw = 'Brother-In-Law',
  Siblings = 'Siblings',
  Son = 'Son',
  Daughter = 'Daughter'
}

export enum Commands {
  ADD_CHILD = 'ADD_CHILD',
  GET_RELATIONSHIP = 'GET_RELATIONSHIP'
}

export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export const Relatives: { Uncle: RelativeType; Aunt: RelativeType } = {
  Uncle: 'uncle',
  Aunt: 'aunt'
}
export const Parent: { Mother: ParentType; Father: ParentType } = {
  Mother: 'mother',
  Father: 'father'
}

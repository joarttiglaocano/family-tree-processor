import { Gender, Relationship } from '../enums'
import Family from '../models/Family'
import { AddChildProps, Person } from '../types'
import { Messages } from '../utils/messages'

describe('Family', () => {
    let mother: string
    let father: string
    let family: Family

    beforeEach(() => {
        family = new Family([
            {
                name: 'Test',
                mother: mother,
                father: father,
                gender: Gender.Male,
                children: [
                    {
                        name: 'Test2',
                        mother: mother,
                        father: father,
                        gender: Gender.Male,
                        children: []
                    },
                    {
                        name: 'Test3',
                        mother: mother,
                        father: father,
                        gender: Gender.Male,
                        children: []
                    }
                ]
            }
        ])
    })

    describe('getRelationship', () => {
        beforeEach(() => {
            // family.getSiblings = jest.fn()
            family.findMember = jest.fn()
        })

        test('should return PERSON_NOT_FOUND if person is not found', () => {
            family.findMember = jest.fn().mockReturnValue(undefined)
            const result = family.getRelationship('NonexistentPerson', 'Siblings' as Relationship)
            console.log(result)
            expect(result).toBe(Messages.PERSON_NOT_FOUND)
        })

        test('should return RELATIONSHIP_NOT_HANDLED if relationship is not handled', () => {
            family.findMember = jest.fn().mockReturnValue({ name: 'Test' })
            const result = family.getRelationship('Test', 'NonexistentRelationship' as Relationship)
            expect(result).toBe(Messages.RELATIONSHIP_NOT_HANDLED)
        })

        // test('should return siblings', () => {
        //   family.getSiblings = jest.fn().mockReturnValue([{ name: 'Sibling1' }, { name: 'Sibling2' }])

        //   family.findMember = jest.fn().mockReturnValue({ name: 'Test', mother: 'test', children: [] })
        //   // const result = family.getRelationship('Test', Relationship.Siblings)
        //   console.log(result)
        //   expect(result).toEqual(['Sibling1', 'Sibling2'])
        // })
    })

    describe('addChild', () => {
        let motherName: string
        let fatherName: string
        let childName: string
        let gender: Gender
        let family: Family
        let childProps: AddChildProps
        beforeEach(() => {
            family = new Family([
                {
                    name: 'Test',
                    mother: motherName,
                    father: fatherName,
                    gender: Gender.Male,
                    children: [
                        {
                            name: 'Test2',
                            mother: motherName,
                            father: fatherName,
                            gender: Gender.Male,
                            children: []
                        },
                        {
                            name: 'Test3',
                            mother: motherName,
                            father: fatherName,
                            gender: Gender.Male,
                            children: []
                        }
                    ]
                }
            ])
            // family.getSiblings = jest.fn()
            family.findMember = jest.fn()

            childProps = {
                motherName,
                childName,
                gender
            }
        })

        test('should return PERSON_NOT_FOUND if person is not found', () => {
            family.findMember = jest.fn().mockReturnValue(undefined)
            const result = family.addChild(childProps)
            expect(result).toBe(Messages.PERSON_NOT_FOUND)
        })

        test('should add child successfully', () => {
            const addChildProps = {
                motherName: 'Mother',
                fatherName: 'Father',
                childName: 'w',
                gender: Gender.Female,
                family: family.getFamilyMembers(),
                children: []
            }

            // const mockAddMember = (family.addMember = jest.fn())

            // Mock the findMember method to return a truthy value
            family.findMember = jest.fn().mockReturnValue({})

            family.addChild(addChildProps)

            // Check if addMember was called with the correct arguments
            // expect(mockAddMember).toHaveBeenCalledWith({
            //   name: 'w',
            //   gender: Gender.Female,
            //   mother: 'Mother',
            //   father: 'Father',
            //   children: []
            // })
        })
    })
})

import fs from 'fs'
import path from 'path'
import _isEmpty from 'lodash/isEmpty'
import _isArray from 'lodash/isArray'
import _isString from 'lodash/isString'
import { Commands, Gender, Relationship } from './enums'
import { Family as FamilyType, Person } from './types'
import Family from './models/Family'
import defaultLogger from './utils/logger'
import { Messages } from './utils/messages'

const familyTreeData = require('./configs/data.json')
const configPath = path.join(__dirname, './configs')
const familyMembers: FamilyType = familyTreeData.children

class FamilyTreeProcessor {
    private family: Family

    constructor(members: Person[]) {
        this.family = new Family(members)
    }

    private processCommand(command: string) {
        const [action, motherName, param1, gender] = command.split(' ')
        const relationship = param1 as Relationship
        const childName = param1

        switch (action) {
            case Commands.ADD_CHILD:
                return this.addChildToFamily(motherName, childName, gender as Gender)
            case Commands.GET_RELATIONSHIP:
                return this.getRelative(motherName, relationship)
            default:
                defaultLogger.log(Messages.INVALID_COMMAND)
        }
    }

    private addChildToFamily(motherName: string, childName: string, gender: Gender) {
        try {
            const result = this.family.addChild({
                motherName,
                childName,
                gender
            })

            defaultLogger.log(result)
        } catch (error) {
            defaultLogger.log(Messages.CHILD_ADDITION_FAILED)
        }
    }

    private getRelative(motherName: string, relationship: Relationship) {
        try {
            const relatives = this.family.getRelationship(motherName, relationship)
            let message = Messages.NONE

            if (_isArray(relatives) && !_isEmpty(relatives)) {
                message = relatives.join(' ')
            } else if (_isString(relatives)) {
                message = relatives
            }

            defaultLogger.log(message)
        } catch (error) {
            defaultLogger.log(Messages.NONE)
        }
    }

    public processCommands() {
        const commands = fs.readFileSync(`${configPath}/commands.txt`, 'utf-8').split('\n')
        commands.forEach((command) => this.processCommand(command))
    }
}

export default FamilyTreeProcessor

const processor = new FamilyTreeProcessor(familyMembers)
processor.processCommands()

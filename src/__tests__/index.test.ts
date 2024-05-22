import fs from 'fs'
import FamilyTreeProcessor from '..'
import { Messages } from '../utils'
import defaultLogger from '../utils/logger'

describe('FamilyTreeProcessor', () => {
  let processor: FamilyTreeProcessor

  beforeEach(() => {
    processor = new FamilyTreeProcessor()
    ;(processor as any).processCommand = jest.fn()
  })

  describe('processCommands', () => {
    it('should execute ADD_CHILD command', () => {
      const commands = ['ADD_CHILD Mother Child Male']
      const mockResult = commands[0]

      fs.readFileSync = jest.fn().mockReturnValue(commands.join('\n'))
      const addChildMock = jest.fn()
      ;(processor as any).processCommand = addChildMock // Assign the mock function to processCommand
      processor.processCommands()
      expect(addChildMock).toHaveBeenCalledWith(mockResult)
    })

    it('should execute GET_RELATIONSHIP command', () => {
      const commands = ['GET_RELATIONSHIP Person Siblings']
      const mockResult = commands[0]

      fs.readFileSync = jest.fn().mockReturnValue(commands.join('\n'))
      const getRelationshipMock = jest.fn()
      ;(processor as any).processCommand = getRelationshipMock // Assign the mock function to processCommand
      processor.processCommands()
      expect(getRelationshipMock).toHaveBeenCalledWith(mockResult)
    })

    it('should log an error for invalid command', () => {
      const commands = ['INVALID_COMMAND']
      fs.readFileSync = jest.fn().mockReturnValue(commands.join('\n'))
      const logMock = jest.fn()
      defaultLogger.log = logMock // Assign the mock function to log
      processor.processCommands()
      expect(logMock).toHaveBeenCalledWith(Messages.INVALID_COMMAND)
    })
  })
})

import {expect} from 'chai'
import {InputLogger} from '../../../src/domain/input-logger.js'
import {createStoredEvent} from '../helpers/mock-stream.js'

describe('InputLogger entity', () => {
  describe('verify that initial state is accurate:', () => {
    it('lastInput is null', () => {
      const state = InputLogger.empty()

      expect(state.lastInput).to.be.null
    })

    it('inputCount is zero', () => {
      const state = InputLogger.empty()

      expect(state.inputCount).to.equal(0)
    })

    it('matches expected', () => {
      const state = InputLogger.empty()

      expect(state).to.eql({
        lastInput: null,
        inputCount: 0,
      })
    })
  })

  describe('eventHandlers', () => {
    describe('input-logged', () => {
      let state

      beforeEach(() => {
        state = InputLogger.empty()
      })

      it('updates lastInput from event data', () => {
        const event = createStoredEvent('input-logged', {value: 'test-value'})

        const newState = InputLogger.apply(state, event)

        expect(newState.lastInput).to.equal('test-value')
      })

      it('increments inputCount by 1', () => {
        const event = createStoredEvent('input-logged', {value: 'test'})

        const newState = InputLogger.apply(state, event)

        expect(newState.inputCount).to.equal(1)
      })

      it('accumulates inputCount across multiple events', () => {
        state = InputLogger.apply(state, createStoredEvent('input-logged', {value: 'first'}, {version: 1}))
        state = InputLogger.apply(state, createStoredEvent('input-logged', {value: 'second'}, {version: 2}))

        expect(state.inputCount).to.equal(2)
        expect(state.lastInput).to.equal('second')
      })

      it('does not mutate original state', () => {
        const event = createStoredEvent('input-logged', {value: 'test'})

        const newState = InputLogger.apply(state, event)

        expect(state.lastInput).to.be.null // Original unchanged
        expect(state.inputCount).to.equal(0) // Original unchanged
        expect(newState.lastInput).to.equal('test') // New state changed
        expect(newState.inputCount).to.equal(1) // New state changed
      })
    })
  })

  describe('commands', () => {
    describe('logInput', () => {
      it('returns event with correct data structure', () => {
        const state = InputLogger.empty()

        const events = InputLogger.logInput(state, 'my-input')

        expect(events).to.eql([{type: 'input-logged', data: {value: 'my-input'}}])
      })

      it('preserves input value exactly', () => {
        const state = InputLogger.empty()
        const input = 'special-chars-!@#$%^&*()'

        const events = InputLogger.logInput(state, input)

        expect(events[0].data.value).to.equal(input)
      })
    })
  })

  describe('queries', () => {
    describe('hasInput', () => {
      it('returns false for empty state', () => {
        const state = InputLogger.empty()

        expect(InputLogger.hasInput(state)).to.be.false
      })

      it('returns true when lastInput exists', () => {
        const state = {...InputLogger.empty(), lastInput: 'something'}

        expect(InputLogger.hasInput(state)).to.be.true
      })

      it('returns true even for empty string input', () => {
        const state = {...InputLogger.empty(), lastInput: ''}

        // Empty string is truthy for "has input" - it's not null
        // Depends on implementation: !== null means empty string is "has input"
        expect(InputLogger.hasInput(state)).to.be.true
      })
    })
  })
})

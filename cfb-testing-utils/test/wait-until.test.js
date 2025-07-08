import {expect} from 'chai'
import {waitUntil} from '../src/wait-until.js'

describe('waitUntil', () => {
  describe('when resolves to true', () => {
    it('Should return immediately when predicate is already true', async () => {
      const predicate = () => true

      const startTime = Date.now()
      await waitUntil(predicate)
      const endTime = Date.now()

      expect(endTime - startTime).to.be.at.least(0).and.at.most(50) // Should return almost immediately
    })

    it('Should wait until predicate becomes true', async () => {
      let shouldReturnTrue = false
      const predicate = () => shouldReturnTrue

      // Set predicate to return true after a short delay
      setTimeout(() => {
        shouldReturnTrue = true
      }, 50)

      const startTime = Date.now()
      await waitUntil(predicate)
      const endTime = Date.now()

      expect(endTime - startTime).to.be.at.least(40).and.at.most(100) // Should have waited but not too long
    })

    it('Should handle predicate that returns false initially then true', async () => {
      let callCount = 0
      const predicate = () => {
        callCount++
        return callCount >= 3 // Return true on third call
      }

      await waitUntil(predicate)

      expect(callCount).to.equal(3)
    })
  })

  describe('when does not resolve', () => {
    it('Should throw timeout error when predicate never becomes true', async () => {
      const predicate = () => false

      try {
        await waitUntil(predicate)
        expect.fail('Should have thrown a timeout error')
      } catch (error) {
        expect(error.message).to.include('Timeout of 100ms exceeded')
      }
    })

    it('Should use default timeout of 100ms when not specified', async () => {
      const predicate = () => false
      const startTime = Date.now()

      try {
        await waitUntil(predicate)
        expect.fail('Should have thrown a timeout error')
      } catch (error) {
        const endTime = Date.now()
        expect(endTime - startTime).to.be.at.least(90).and.at.most(150) // Should wait close to 100ms
        expect(error.message).to.include('Timeout of 100ms exceeded')
      }
    })

    it('Should use custom timeout when specified', async () => {
      const predicate = () => false
      const customTimeout = 200
      const startTime = Date.now()

      try {
        await waitUntil(predicate, customTimeout)
        expect.fail('Should have thrown a timeout error')
      } catch (error) {
        const endTime = Date.now()
        expect(endTime - startTime).to.be.at.least(180).and.at.most(250) // Should wait close to 200ms
        expect(error.message).to.include(`Timeout of ${customTimeout}ms exceeded`)
      }
    })

    it('Should handle predicate that throws an error', async () => {
      const predicate = () => {
        throw new Error('Predicate error')
      }

      try {
        await waitUntil(predicate)
        expect.fail('Should have thrown a predicate error')
      } catch (error) {
        expect(error.message).to.include('Predicate error')
      }
    })
  })

  describe('loop behavior', () => {
    it('Should handle async predicates correctly', async () => {
      let callCount = 0
      const predicate = async () => {
        callCount++
        await new Promise(resolve => setTimeout(resolve, 10)) // Simulate async work
        return callCount >= 3 // Return true on third call
      }

      await waitUntil(predicate)

      expect(callCount).to.equal(3)
    })

    it('Should handle synchronous predicates correctly', async () => {
      let callCount = 0
      const predicate = () => {
        callCount++
        return callCount >= 2 // Return true on second call
      }

      await waitUntil(predicate)

      expect(callCount).to.equal(2)
    })
  })
})

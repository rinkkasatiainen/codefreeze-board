import { AssertionError, expect, use } from 'chai'
import { spy } from 'sinon'
import sinonChai from 'sinon-chai'
import { Eventually } from '../src/eventually.js'

use(sinonChai)

const throwsError = (msg = 'Error thrown') => {
  throw new Error(msg)
}

const notCalled = name => () => {
  throw new AssertionError(`Method '${name}' should not have been called`)
}
const isNotReject = notCalled('onReject')
const isNotResolve = notCalled('onResolve')

const identity = x => x
const toEql = expected => value => expect(value).to.eql(expected)

describe('Eventually monad', () => {
  describe('Eventually.resolve', () => {
    it('should create a Resolve instance', () => {
      const resolve = Eventually.resolve(42)
      resolve.fold(isNotReject, toEql(42))
    })

    it('should handle different value types', () => {
      const resolve1 = Eventually.resolve(42)
      const resolve2 = Eventually.resolve('success')
      const resolve3 = Eventually.resolve({ data: 'value' })
      const resolve4 = Eventually.resolve([1, 2, 3])

      resolve1.fold(isNotReject, toEql(42))
      resolve2.fold(isNotReject, toEql('success'))
      resolve3.fold(isNotReject, toEql({ data: 'value' }))
      resolve4.fold(isNotReject, toEql([1, 2, 3]))
    })

    it('should handle promises as values', () => {
      const promise = Promise.resolve(42)
      const resolve = Eventually.resolve(promise)
      resolve.fold(isNotReject, value => {
        expect(value).to.equal(promise)
      })
    })
  })

  describe('Eventually.reject', () => {
    it('should create a Reject instance', () => {
      const reject = Eventually.reject('error')
      expect(reject.fold(identity, isNotResolve)).to.equal('error')
    })

    it('should handle different error types', () => {
      const reject1 = Eventually.reject('string error')
      const reject2 = Eventually.reject({ code: 404, message: 'Not found' })
      const reject3 = Eventually.reject(new Error('error object'))

      expect(reject1.fold(identity, isNotResolve)).to.equal('string error')
      expect(reject2.fold(identity, isNotResolve)).to.deep.equal({ code: 404, message: 'Not found' })
      expect(reject3.fold(identity, isNotResolve)).to.be.instanceOf(Error)
    })
  })

  describe('Eventually.fromPromise', () => {
    it('should convert a resolved promise to Resolve', async () => {
      const promise = Promise.resolve(42)
      const eventually = await Eventually.fromPromise(promise)
      eventually.fold(isNotReject, toEql(42))
    })

    it('should convert a rejected promise to Reject', async () => {
      const promise = Promise.reject('error message')
      const eventually = await Eventually.fromPromise(promise)
      expect(eventually.fold(identity, isNotResolve)).to.equal('error message')
    })

    it('should handle promise that resolves to different types', async () => {
      const promise1 = Promise.resolve('string')
      const promise2 = Promise.resolve({ a: 1 })
      const promise3 = Promise.resolve([1, 2, 3])

      const eventually1 = await Eventually.fromPromise(promise1)
      const eventually2 = await Eventually.fromPromise(promise2)
      const eventually3 = await Eventually.fromPromise(promise3)

      eventually1.fold(isNotReject, toEql('string'))
      eventually2.fold(isNotReject, toEql({ a: 1 }))
      eventually3.fold(isNotReject, toEql([1, 2, 3]))
    })
  })

  describe('Resolve.map with synchronous functions', () => {
    it('should apply synchronous function and return Resolve', async () => {
      const resolve = Eventually.resolve(5)
      const result = await resolve.map(x => x * 2)
      result.fold(isNotReject, toEql(10))
    })

    it('should handle functions that return different types', async () => {
      const resolve = Eventually.resolve(5)
      const result = await resolve.map(x => `Number: ${x}`)
      result.fold(isNotReject, toEql('Number: 5'))
    })

    it('should chain multiple synchronous maps', async () => {
      const resolve = Eventually.resolve(5)
      const result1 = await resolve.map(x => x * 2)
      const result2 = await result1.map(x => x + 1)
      const result3 = await result2.map(x => x.toString())
      result3.fold(isNotReject, toEql('11'))
    })

    it('should handle functions that throw errors', async () => {
      const resolve = Eventually.resolve(5)

      await expect(() => throwsError('ffoo')).to.throw()
      try {
        await resolve.map(throwsError)
      } catch {
        return
      }
      throw new AssertionError('Expected to throw an error')

    })
  })

  describe('Resolve.map with asynchronous functions', () => {
    it('should handle function that returns a promise', async () => {
      const resolve = Eventually.resolve(5)
      const result = await resolve.map(async x => await Promise.resolve(x * 2))
      result.fold(isNotReject, toEql(10))
    })

    it('should handle function that returns a rejected promise', async () => {
      const resolve = Eventually.resolve(5)
      try {
        await resolve.map(() => Promise.reject('async error'))
      } catch {
        return
      }
      throw new AssertionError('Expected to throw an error')
    })

    it('should chain maps with mixed sync and async functions', async () => {
      const resolve = Eventually.resolve(5)
      const result1 = await resolve.map(x => x * 2) // sync
      result1.fold(isNotReject, toEql(10))

      const result2 = await result1.map(x => Promise.resolve(x + 1)) // async
      result2.fold(isNotReject, toEql(11))

      const result3 = await result2.map(x => x.toString()) // sync again
      result3.fold(isNotReject, toEql('11'))
    })

    it('should handle async function that throws synchronously', async () => {
      const resolve = Eventually.resolve(5)
      try {
        await resolve.map(async () => throwsError('sync error in async context'))
      } catch {
        return
      }
      throw new AssertionError('Expected to throw an error')
    })
  })

  describe('Reject.map', () => {
    it('should return Reject unchanged without calling the function', async () => {
      const reject = Eventually.reject('error')
      const spyFn = spy()
      const called = false
      const result = await reject.map(spyFn)
      expect(result.fold(identity, isNotResolve)).to.equal('error')
      expect(spyFn).to.not.have.been.called
      expect(called).to.be.false
    })

    it('should return Reject unchanged even with async function', async () => {
      const reject = Eventually.reject('error')
      let called = false
      const result = await reject.map(() => {
        called = true
        return Promise.resolve(42)
      })
      expect(result.fold(identity, isNotResolve)).to.equal('error')
      expect(called).to.be.false
    })

    it('should chain maps and always return Reject unchanged', async () => {
      const reject = Eventually.reject('error')
      let callCount = 0
      const result1 = await reject.map(() => {
        callCount++
        return 1
      })
      const result2 = await result1.map(() => {
        callCount++
        return Promise.resolve(2)
      })
      expect(result2.fold(identity, isNotResolve)).to.equal('error')
      expect(callCount).to.equal(0)
    })
  })

  describe('Resolve.bind with synchronous functions', () => {
    it('should apply function that returns Resolve and flatten', async () => {
      const resolve = Eventually.resolve(5)
      const result = await resolve.bind(x => Eventually.resolve(x * 2))
      result.fold(isNotReject, toEql(10))
    })

    it('should flatten Resolve(Reject) to Reject', async () => {
      const resolve = Eventually.resolve(5)
      const result = await resolve.bind(() => Eventually.reject('error'))
      expect(result.fold(identity, isNotResolve)).to.equal('error')
    })

    it('should chain multiple synchronous binds', async () => {
      const resolve = Eventually.resolve(5)
      const result1 = await resolve.bind(x => Eventually.resolve(x * 2))
      const result2 = await result1.bind(x => Eventually.resolve(x + 1))
      const result3 = await result2.bind(x => Eventually.resolve(x.toString()))
      result3.fold(isNotReject, toEql('11'))
    })

    it('should handle function that throws error', async () => {
      const resolve = Eventually.resolve(5)
      const result = await resolve.bind(() => {
        throw new Error('bind error')
      })
      const reason = result.fold(identity, isNotResolve)
      expect(reason.message).to.equal('bind error')
    })

    it('should handle function that returns non-Eventually value', async () => {
      const resolve = Eventually.resolve(5)
      const result = await resolve.bind(x => x * 2)
      result.fold(isNotReject, toEql(10))
    })
  })

  describe('Resolve.bind with asynchronous functions', () => {
    it('should handle function that returns a promise resolving to Eventually', async () => {
      const resolve = Eventually.resolve(5)
      const result = await resolve.bind(x =>
        Promise.resolve(Eventually.resolve(x * 2)),
      )
      result.fold(isNotReject, toEql(10))
    })

    it('should handle function that returns a promise resolving to value (wrap in Resolve)', async () => {
      const resolve = Eventually.resolve(5)
      const result = await resolve.bind(x => Promise.resolve(x * 2))
      result.fold(isNotReject, toEql(10))
    })

    it('should handle function that returns a rejected promise', async () => {
      const resolve = Eventually.resolve(5)
      const result = await resolve.bind(() => Promise.reject('async bind error'))
      expect(result.fold(identity, isNotResolve)).to.equal('async bind error')
    })

    it('should short-circuit to Reject when bind returns Reject', async () => {
      const resolve = Eventually.resolve(5)
      let callCount = 0
      const result1 = await resolve.bind(x => {
        callCount++
        return Eventually.resolve(x * 2)
      })
      const result2 = await result1.bind(() => {
        callCount++
        return Eventually.reject('error')
      })
      const result3 = await result2.bind(() => {
        callCount++
        return Eventually.resolve(999)
      })
      expect(result3.fold(identity, isNotResolve)).to.equal('error')
      expect(callCount).to.equal(2)
    })

    it('should handle mixed sync and async binds', async () => {
      const resolve = Eventually.resolve(5)
      const result1 = await resolve.bind(x => Eventually.resolve(x * 2))
      result1.fold(isNotReject, toEql(10))

      const result2 = await result1.bind(x => Promise.resolve(Eventually.resolve(x + 1)))
      result2.fold(isNotReject, toEql(11))

      const result3 = await result2.bind(x => Eventually.resolve(x.toString()))
      result3.fold(isNotReject, toEql('11'))
    })
  })

  describe('Reject.bind', () => {
    it('should return Reject unchanged without calling the function', async () => {
      const reject = Eventually.reject('error')
      let called = false
      const result = await reject.bind(() => {
        called = true
        return Eventually.resolve(42)
      })
      expect(result.fold(identity, isNotResolve)).to.equal('error')
      expect(called).to.be.false
    })

    it('should return Reject unchanged even with async function', async () => {
      const reject = Eventually.reject('error')
      let called = false
      const result = await reject.bind(() => {
        called = true
        return Promise.resolve(Eventually.resolve(42))
      })
      expect(result.fold(identity, isNotResolve)).to.equal('error')
      expect(called).to.be.false
    })

    it('should chain binds and always return Reject unchanged', async () => {
      const reject = Eventually.reject('error')
      let callCount = 0
      const result1 = await reject.bind(() => {
        callCount++
        return Eventually.resolve(1)
      })
      const result2 = await result1.bind(() => {
        callCount++
        return Promise.resolve(Eventually.resolve(2))
      })
      expect(result2.fold(identity, isNotResolve)).to.equal('error')
      expect(callCount).to.equal(0)
    })
  })

  describe('Resolve.fold', () => {
    it('should call onResolve with the value for synchronous function', () => {
      const resolve = Eventually.resolve(42)
      const result = resolve.fold(
        reason => `Error: ${reason}`,
        value => `Success: ${value}`,
      )
      expect(result).to.equal('Success: 42')
    })

    it('should not call onReject', () => {
      const resolve = Eventually.resolve(42)
      let onRejectCalled = false
      resolve.fold(
        reason => {
          onRejectCalled = true
          return `Error: ${reason}`
        },
        value => `Success: ${value}`,
      )
      expect(onRejectCalled).to.be.false
    })

    it('should handle onResolve that returns a promise', async () => {
      const resolve = Eventually.resolve(42)
      const result = resolve.fold(
        reason => Promise.resolve(`Error: ${reason}`),
        value => Promise.resolve(`Success: ${value}`),
      )
      expect(result).to.be.instanceOf(Promise)
      const resolved = await result
      expect(resolved).to.equal('Success: 42')
    })

    it('should handle onResolve that throws error', () => {
      const resolve = Eventually.resolve(42)
      const result = resolve.fold(
        reason => `Error: ${reason.message}`,
        () => {
          throw new Error('fold error')
        },
      )
      // fold catches errors and calls onReject with the error
      expect(result).to.equal('Error: fold error')
    })
  })

  describe('Reject.fold', () => {
    it('should call onReject with the reason', () => {
      const reject = Eventually.reject('error message')
      const result = reject.fold(
        reason => `Error: ${reason}`,
        isNotResolve,
      )
      expect(result).to.equal('Error: error message')
    })

    it('should not call onResolve', () => {
      const reject = Eventually.reject('error')
      let onResolveCalled = false
      reject.fold(
        reason => `Error: ${reason}`,
        () => {
          onResolveCalled = true
          return 'Success'
        },
      )
      expect(onResolveCalled).to.be.false
    })

    it('should handle onReject that returns different types', () => {
      const reject = Eventually.reject('error')
      const result = reject.fold(
        () => 0,
        value => value * 2,
      )
      expect(result).to.equal(0)
    })

    it('should handle error objects', () => {
      const error = new Error('something went wrong')
      const reject = Eventually.reject(error)
      const result = reject.fold(
        err => err.message,
        isNotResolve,
      )
      expect(result).to.equal('something went wrong')
    })
  })

  describe('Integration scenarios', () => {
    it('should handle async API call workflow', async () => {
      const fetchData = async id => {
        if (id > 0) {
          return Promise.resolve({ id, data: `Data for ${id}` })
        }
        return Promise.reject('Invalid ID')
      }

      const processData = data => data.data.toUpperCase()

      // Test successful case
      const eventually1 = Eventually.resolve(5)
      const resolved1 = await eventually1.bind(id => Eventually.fromPromise(fetchData(id)))
      const mapped1 = await resolved1.map(data => processData(data))
      const result1 = mapped1.fold(
        error => `Error: ${error}`,
        value => `Success: ${value}`,
      )
      expect(result1).to.equal('Success: DATA FOR 5')

      // Test error case
      const eventually2 = Eventually.resolve(-1)
      const resolved2 = await eventually2.bind(id => Eventually.fromPromise(fetchData(id)))
      const mapped2 = await resolved2.map(data => processData(data))
      const result2 = mapped2.fold(
        error => `Error: ${error}`,
        value => `Success: ${value}`,
      )
      expect(result2).to.equal('Error: Invalid ID')
    })

    it('should handle chained async operations', async () => {
      const asyncDouble = x => Promise.resolve(x * 2)
      const asyncAdd = x => Promise.resolve(Eventually.resolve(x + 1))

      const resolve = Eventually.resolve(5)
      const resolved1 = await resolve.map(x => asyncDouble(x))
      resolved1.fold(isNotReject, toEql(10))

      const result2 = await resolved1.bind(x => asyncAdd(x))
      result2.fold(isNotReject, toEql(11))
    })

    it('should handle error propagation through async chain', async () => {
      const asyncFail = () => Promise.reject('operation failed')

      const resolve = Eventually.resolve(5)
      const resolved1 = await resolve.map(x => x * 2)
      const bound = await resolved1.bind(() => asyncFail())
      const mapped2 = await bound.map(x => x + 1)

      expect(mapped2.fold(identity, isNotResolve)).to.equal('operation failed')
    })

    it('should handle mixed sync and async operations', async () => {
      const resolve = Eventually.resolve(10)
      const resolved1 = await resolve.map(x => x + 5) // sync
      const bound1 = await resolved1.bind(x => Promise.resolve(Eventually.resolve(x * 2))) // async bind
      const resolved2 = await bound1.map(x => x.toString()) // sync
      const bound2 = await resolved2.bind(x => Eventually.resolve(`Result: ${x}`)) // sync bind

      bound2.fold(isNotReject, toEql('Result: 30'))
    })
  })
})


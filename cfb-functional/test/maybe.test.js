import { AssertionError, expect, use } from 'chai'
import sinonChai from 'sinon-chai'
import { spy } from 'sinon'
import { Maybe } from '../src/maybe.js'

use(sinonChai)

const notCalled = name => () => {
  throw new AssertionError(`Method '${name}' should not have been called`)
}
const isNotNone = notCalled('onNone')
const isNotSome = notCalled('onSome')
const isNone = () => {
  /* no-op*/
}

const toEql = expected => value => expect(value).to.eql(expected)

describe('Maybe monad', () => {
  describe('Maybe.some', () => {
    it('should create a Some instance', () => {
      const some = Maybe.of(42)
      some.fold(notCalled, it => {
        expect(it).to.eql(42)
      })
    })

    it('null turns into None', () => {
      const some = Maybe.of(null)
      some.fold(isNone, isNotSome)
    })

    it('undefined turns into None', () => {
      const some = Maybe.of(undefined)
      some.fold(isNone, isNotSome)
    })

    it('should handle objects', () => {
      const obj = { a: 1, b: 2 }
      const some = Maybe.of(obj)
      some.fold(notCalled, toEql(obj))
    })

    it('should handle arrays', () => {
      const arr = [1, 2, 3]
      const some = Maybe.of(arr)
      some.fold(notCalled, toEql(arr))
    })
  })

  describe('Maybe.none', () => {
    it('should create a None instance', () => {
      const none = Maybe.none()
      none.fold(isNone, isNotSome)
    })

    it('should always return the same None instance structure', () => {
      const none1 = Maybe.none()
      const none2 = Maybe.of(null)
      expect(none1).to.eq(none2)
    })
  })

  describe('Some.map', () => {
    it('should apply function to value and return Some with result', () => {
      const some = Maybe.of(5)
      const result = some.map(x => x * 2)

      result.fold(notCalled, toEql(10))
    })

    it('should handle functions that return different types', () => {
      const some = Maybe.of(5)
      const result = some.map(x => `Number: ${x}`)

      result.fold(notCalled, toEql('Number: 5'))
    })

    it('should handle functions that return objects', () => {
      const some = Maybe.of(5)
      const result = some.map(x => ({ doubled: x * 2 }))

      result.fold(notCalled, toEql({ doubled: 10 }))
    })

    it('should handle functions that return null', () => {
      const some = Maybe.of(5)
      const result = some.map(() => null)

      result.fold(isNone, isNotSome)
    })

    it('should handle functions that return undefined', () => {
      const some = Maybe.of(5)
      const result = some.map(() => undefined)

      result.fold(isNone, isNotSome)
    })

    it('should chain multiple maps', () => {
      const some = Maybe.of(5)
      const result = some.map(x => x * 2).map(x => x + 1).map(x => x.toString())

      result.fold(isNotNone, toEql('11'))
    })
  })

  describe('None.map', () => {
    it('should return None without calling the function', () => {
      const none = Maybe.none()
      let called = false
      const result = none.map(() => {
        called = true
        return 42
      })

      result.fold(isNone, isNotSome)
      expect(called).to.eq(false)
    })

    it('should chain maps and always return None', () => {
      const none = Maybe.none()
      let callCount = 0
      const result = none
        .map(() => {
          callCount++
          return 1
        })
        .map(() => {
          callCount++
          return 2
        })
        .map(() => {
          callCount++
          return 3
        })
      result.fold(isNone, isNotSome)
      expect(callCount).to.equal(0)
    })
  })

  describe('Some.bind', () => {
    it('should apply function that returns Maybe and flatten result', () => {
      const some = Maybe.of(5)
      const result = some.bind(x => Maybe.of(x * 2))

      result.fold(isNotNone, toEql(10))
    })

    it('should flatten Some(None) to None', () => {
      const some = Maybe.of(5)
      const result = some.bind(() => Maybe.none())

      result.fold(isNone, isNotSome)
    })

    it('should chain multiple binds', () => {
      const some = Maybe.of(5)
      const result = some
        .bind(x => Maybe.of(x * 2))
        .map(x => x + 1)
        .bind(x => Maybe.of(x.toString()))

      result.fold(isNotNone, toEql('11'))
    })

    it('should short-circuit to None when bind returns None', () => {
      const some = Maybe.of(5)
      let callCount = 0
      const result = some
        .bind(x => {
          callCount++
          return Maybe.of(x * 2)
        })
        .bind(() => {
          callCount++
          return Maybe.none()
        })
        .bind(() => {
          callCount++
          return Maybe.of(999)
        })

      result.fold(isNone, isNotSome)
      expect(callCount).to.equal(2)
    })
  })

  describe('None.bind', () => {
    it('should return None without calling the function', () => {
      const none = Maybe.none()
      let called = false
      const result = none.bind(() => {
        called = true
        return Maybe.of(42)
      })

      result.fold(isNone, isNotSome)
      expect(called).to.be.false
    })

    it('should chain binds and always return None', () => {
      const none = Maybe.none()
      let callCount = 0
      const result = none
        .bind(() => {
          callCount++
          return Maybe.of(1)
        })
        .bind(() => {
          callCount++
          return Maybe.of(2)
        })

      result.fold(isNone, isNotSome)
      expect(callCount).to.equal(0)
    })
  })

  describe('Some.fold', () => {
    it('should call onSome with the value', () => {
      const some = Maybe.of(42)
      some.fold(isNotNone, toEql(42))
    })

    it('should not call onNone', () => {
      const some = Maybe.of(42)
      const spyFn = spy()
      some.fold(isNotNone, spyFn)
      expect(spyFn).to.have.been.called
    })

    it('should handle functions that return different types', () => {
      const some = Maybe.of(42)
      const result = some.fold(() => 0, value => value * 2)
      expect(result).to.equal(84)
    })

    it('should handle functions that return objects', () => {
      const some = Maybe.of(42)
      const result = some.fold(() => ({ error: true }), value => ({ value, success: true }))
      expect(result).to.deep.equal({ value: 42, success: true })
    })
  })

  describe('None.fold', () => {
    it('should call onNone', () => {
      const none = Maybe.none()
      const spyFn = spy()
      none.fold(spyFn, isNotSome)
      expect(spyFn).to.have.been.called
    })

    it('should handle functions that return different types', () => {
      const none = Maybe.none()
      const result = none.fold(() => 0, value => value * 2)
      expect(result).to.equal(0)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle a complete workflow with map and bind', () => {
      const result = Maybe.of(10)
        .map(x => x + 5)
        .bind(x => Maybe.of(x * 2))
        .map(x => `Result: ${x}`)
        .fold(() => 'No result', value => value)
      expect(result).to.equal('Result: 30')
    })

    it('should handle a workflow that results in None', () => {
      const result = Maybe.of(3)
        .map(x => x + 2)
        .bind(Maybe.none)
        .map(x => `Result: ${x}`)
        .fold(() => 'No result', value => value)
      expect(result).to.equal('No result')
    })

    it('should handle safe division', () => {
      const divide = (a, b) => {
        if (b === 0) {
          return Maybe.none()
        }
        return Maybe.of(a / b)
      }

      const result1 = divide(10, 2).fold(() => 'Error', x => x.toString())
      expect(result1).to.equal('5')

      const result2 = divide(10, 0).fold(() => 'Error', x => x.toString())
      expect(result2).to.equal('Error')
    })

    it('should handle safe array access', () => {
      const safeGet = (array, index) => {
        if (index < 0 || index >= arr.length) {
          return Maybe.none()
        }
        return Maybe.of(array[index])
      }

      const arr = [10, 20, 30]
      const result1 = safeGet(arr, 1).fold(() => -1, x => x)
      expect(result1).to.equal(20)

      const result2 = safeGet(arr, 5).fold(() => -1, x => x)
      expect(result2).to.equal(-1)
    })
  })
})



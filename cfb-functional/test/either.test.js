import { AssertionError, expect } from 'chai'
import { Either } from '../src/either.js'

const notCalled = name => () => {
  throw new AssertionError(`Method '${name}' should not have been called`)
}
const isNotLeft = notCalled('onLeft')
const isNotRight = notCalled('onRight')

const identity = x => x
const toEql = expected => value => expect(value).to.eql(expected)

describe('Either monad', () => {
  describe('Either.left', () => {
    it('should create a Left instance', () => {
      const left = Either.left('error')
      const result = left.fold(identity, isNotRight)
      expect(result).to.equal('error')
    })

    it('should handle different error types', () => {
      const left1 = Either.left('string error')
      const left2 = Either.left({ code: 404, message: 'Not found' })
      const left3 = Either.left(new Error('error object'))

      expect(left1.fold(identity, isNotRight)).to.equal('string error')
      expect(left2.fold(identity, isNotRight)).to.deep.equal({ code: 404, message: 'Not found' })
      expect(left3.fold(identity, isNotRight)).to.be.instanceOf(Error)
    })

    it('should handle null and undefined', () => {
      const left1 = Either.left(null)
      const left2 = Either.left(undefined)

      expect(left1.fold(identity, isNotRight)).to.be.null
      expect(left2.fold(identity, isNotRight)).to.be.undefined
    })
  })

  describe('Either.right', () => {
    it('should create a Right instance', () => {
      const right = Either.right(42)
      right.fold(isNotLeft, toEql(42))
    })

    it('should handle different value types', () => {
      const right1 = Either.right(42)
      const right2 = Either.right('success')
      const right3 = Either.right({ data: 'value' })
      const right4 = Either.right([1, 2, 3])

      right1.fold(isNotLeft, toEql(42))
      right2.fold(isNotLeft, toEql('success'))
      right3.fold(isNotLeft, toEql({ data: 'value' }))
      right4.fold(isNotLeft, toEql([1, 2, 3]))
    })
  })

  describe('Right.map', () => {
    it('should apply function to value and return Right with result', () => {
      const right = Either.right(5)
      const result = right.map(x => x * 2)

      result.fold(isNotLeft, toEql(10))
    })

    it('should handle functions that return different types', () => {
      const right = Either.right(5)
      const result = right.map(x => `Number: ${x}`)

      result.fold(isNotLeft, toEql('Number: 5'))
    })

    it('should chain multiple maps', () => {
      const right = Either.right(5)
      const result = right.map(x => x * 2).map(x => x + 1).map(x => x.toString())

      result.fold(isNotLeft, toEql('11'))
    })

    it('should handle functions that return objects', () => {
      const right = Either.right(5)
      const result = right.map(x => ({ doubled: x * 2 }))

      result.fold(isNotLeft, toEql({ doubled: 10 }))
    })
  })

  describe('Left.map', () => {
    it('should return Left unchanged without calling the function', () => {
      const left = Either.left('error')
      let called = false
      const result = left.map(() => {
        called = true
        return 42
      })

      expect(result.fold(identity, isNotRight)).to.equal('error')
      expect(called).to.be.false
    })

    it('should chain maps and always return Left unchanged', () => {
      const left = Either.left('error')
      let callCount = 0
      const result = left
        .map(() => {
          callCount++
          return 1
        })
        .map(() => {
          callCount++
          return 2
        })

      expect(result.fold(identity, isNotRight)).to.equal('error')
      expect(callCount).to.equal(0)
    })
  })

  describe('Right.bind', () => {
    it('should apply function that returns Either and flatten result', () => {
      const right = Either.right(5)
      const result = right.bind(x => Either.right(x * 2))

      result.fold(isNotLeft, toEql(10))
    })

    it('should flatten Right(Left) to Left', () => {
      const right = Either.right(5)
      const result = right.bind(() => Either.left('error'))

      result.fold(toEql('error'), isNotRight)
    })

    it('should chain multiple binds', () => {
      const right = Either.right(5)
      const result = right
        .bind(x => Either.right(x * 2))
        .bind(x => Either.right(x + 1))
        .bind(x => Either.right(x.toString()))

      result.fold(isNotLeft, toEql('11'))
    })

    it('should short-circuit to Left when bind returns Left', () => {
      const right = Either.right(5)
      let callCount = 0
      const result = right
        .bind(x => {
          callCount++
          return Either.right(x * 2)
        })
        .bind(() => {
          callCount++
          return Either.left('error')
        })
        .bind(() => {
          callCount++
          return Either.right(999)
        })

      result.fold(toEql('error'), isNotRight)
      expect(callCount).to.equal(2)
    })
  })

  describe('Left.bind', () => {
    it('should return Left unchanged without calling the function', () => {
      const left = Either.left('error')
      let called = false
      const result = left.bind(() => {
        called = true
        return Either.right(42)
      })

      expect(result.fold(identity, isNotRight)).to.equal('error')
      expect(called).to.be.false
    })

    it('should chain binds and always return Left unchanged', () => {
      const left = Either.left('error')
      let callCount = 0
      const result = left
        .bind(() => {
          callCount++
          return Either.right(1)
        })
        .bind(() => {
          callCount++
          return Either.right(2)
        })

      expect(result.fold(identity, isNotRight)).to.equal('error')
      expect(callCount).to.equal(0)
    })
  })

  describe('Right.fold', () => {
    it('should call onRight with the value', () => {
      const right = Either.right(42)
      const result = right.fold(
        isNotLeft,
        value => `Success: ${value}`,
      )
      expect(result).to.equal('Success: 42')
    })

    it('should handle functions that return different types', () => {
      const right = Either.right(42)
      const result = right.fold(
        () => 0,
        value => value * 2,
      )
      expect(result).to.equal(84)
    })

    it('should handle functions that return objects', () => {
      const right = Either.right(42)
      const result = right.fold(
        error => ({ error: true, message: error }),
        value => ({ value, success: true }),
      )
      expect(result).to.deep.equal({ value: 42, success: true })
    })
  })

  describe('Left.fold', () => {
    it('should call onLeft with the error value', () => {
      const left = Either.left('error message')
      const result = left.fold(
        error => `Error: ${error}`,
        isNotRight,
      )
      expect(result).to.equal('Error: error message')
    })

    it('should handle functions that return different types', () => {
      const left = Either.left('error')
      const result = left.fold(
        () => 0,
        value => value * 2,
      )
      expect(result).to.equal(0)
    })

    it('should handle error objects', () => {
      const error = new Error('something went wrong')
      const left = Either.left(error)
      const result = left.fold(
        err => err.message,
        isNotRight,
      )
      expect(result).to.equal('something went wrong')
    })
  })

  describe('Integration scenarios', () => {
    it('should handle a complete workflow with map and bind', () => {
      const result = Either.right(10)
        .map(x => x + 5)
        .bind(x => Either.right(x * 2))
        .map(x => `Result: ${x}`)
        .fold(
          error => `Error: ${error}`,
          value => value,
        )
      expect(result).to.equal('Result: 30')
    })

    it('should handle a workflow that results in Left', () => {
      const result = Either.right(3)
        .map(x => x + 2)
        .bind(() => Either.left('too small'))
        .map(x => `Result: ${x}`)
        .fold(
          error => `Error: ${error}`,
          value => value,
        )
      expect(result).to.equal('Error: too small')
    })

    it('should handle safe division with error messages', () => {
      const divide = (a, b) => {
        if (b === 0) {
          return Either.left('Division by zero')
        }
        return Either.right(a / b)
      }

      const result1 = divide(10, 2).fold(
        error => `Error: ${error}`,
        x => `Result: ${x}`,
      )
      expect(result1).to.equal('Result: 5')

      const result2 = divide(10, 0).fold(
        error => `Error: ${error}`,
        x => `Result: ${x}`,
      )
      expect(result2).to.equal('Error: Division by zero')
    })

    it('should handle validation workflow', () => {
      const validatePositive = num => {
        if (num > 0) {
          return Either.right(num)
        }
        return Either.left('Number must be positive')
      }

      const double = num => Either.right(num * 2)

      const result1 = validatePositive(5)
        .bind(double)
        .fold(
          error => `Error: ${error}`,
          value => `Success: ${value}`,
        )
      expect(result1).to.equal('Success: 10')

      const result2 = validatePositive(-5)
        .bind(double)
        .fold(
          error => `Error: ${error}`,
          value => `Success: ${value}`,
        )
      expect(result2).to.equal('Error: Number must be positive')
    })

    it('should handle JSON parsing safely', () => {
      const parseJSON = str => {
        try {
          return Either.right(JSON.parse(str))
        } catch (error) {
          return Either.left(error.message)
        }
      }

      const result1 = parseJSON('{"a": 1}').fold(
        error => `Parse error: ${error}`,
        value => `Parsed: ${JSON.stringify(value)}`,
      )
      expect(result1).to.equal('Parsed: {"a":1}')

      const result2 = parseJSON('invalid json').fold(
        error => `Parse error: ${error}`,
        value => `Parsed: ${JSON.stringify(value)}`,
      )
      expect(result2).to.include('Parse error:')
    })
  })
})



import { AssertionError, expect } from 'chai'
import { Maybe } from '../src/maybe.js'
import { Either } from '../src/either.js'
import { Eventually } from '../src/eventually.js'

const identity = x => x
const toEql = expected => value => expect(value).to.eql(expected)
const notCalled = name => () => {
  throw new AssertionError(`Method '${name}' should not have been called`)
}
const isNone = () => {
  /* no-op*/
}
const isNotNone = notCalled('onNone')
const isNotSome = notCalled('onSome')
const isNotLeft = notCalled('onLeft')
const isNotReject = notCalled('onReject')

describe('cfb-functional', () => {
  describe('monadic transformations', () => {
    it('Some can wrap an either', () => {
      const either = Either.right(42)
      const maybe = Maybe.of(either)

      maybe.fold(
        isNotNone,
        wrapped => {
          wrapped.fold(isNotLeft, toEql(42))
        },
      )
    })

    it('Some can wrap an eventually', async () => {
      const eventually = Eventually.resolve(42)
      const maybe = Maybe.of(eventually)

      maybe.fold(
        isNotNone,
        wrapped => {
          wrapped.fold(isNotReject, toEql(42))
        },
      )
    })

    it('either can wrap a Maybe', () => {
      const maybe = Maybe.of(42)
      const either = Either.right(maybe)

      either.fold(
        isNotLeft,
        wrapped => {
          wrapped.fold(isNotNone, toEql(42))
        },
      )
    })

    it('either can wrap a Eventually', async () => {
      const eventually = Eventually.resolve(42)
      const either = Either.right(eventually)

      either.fold(
        isNotLeft,
        async wrapped => {
          await wrapped.fold(isNotReject, toEql(42))
        },
      )
    })

    it('either can wrap a Eventually that resolved', async () => {
      const eventually = await Eventually.resolve(42).bind(async x => Promise.resolve(x - 1))
      const either = Either.right(eventually)

      await either.fold(
        isNotLeft,
        wrapped => {
          wrapped.fold(isNotReject, toEql(41))
        },
      )
    })

    it('Eventually can wrap a Maybe', async () => {
      const maybe = Maybe.of(42)
      const eventually = Eventually.resolve(maybe)

      const resolved = await eventually
      resolved.fold(
        isNotReject,
        wrapped => {
          wrapped.fold(isNotNone, toEql(42))
        },
      )
    })

    it('Eventually can wrap an Either', async () => {
      const either = Either.right(42)
      const eventually = Eventually.resolve(either)

      const resolved = await eventually
      resolved.fold(
        isNotReject,
        wrapped => {
          wrapped.fold(isNotLeft, toEql(42))
        },
      )
    })
  })

  describe('bind methods across monads', () => {
    it('some.bind can wrap an Either', () => {
      const maybe = Maybe.of(5)
      const either = maybe.bind(x => Either.right(x * 2))

      either.fold(isNotLeft, toEql(10))
    })

    it('some.bind can wrap an Eventually', async () => {
      const maybe = Maybe.of(5)
      const eventually = maybe.bind(x => Eventually.resolve(x * 2))

      const resolved = await eventually
      resolved.fold(isNotReject, toEql(10))
    })

    it('either monad#bind can wrap a None (Maybe monad)', () => {
      const either = Either.right(5)
      const maybe = either.bind(Maybe.none)

      maybe.fold(isNone, isNotSome)
    })

    it('either monad#bind can wrap a Some (Maybe monad)', () => {
      const either = Either.right(5)
      const maybe = either.bind(x => Maybe.of(x * 2))

      maybe.fold(isNotNone, toEql(10))
    })

    it('eventually#bind monad can Resolve into an either monad', async () => {
      const eventually = Eventually.resolve(5)
      const either = await eventually.bind(x => Either.right(x * 2))

      either.fold(isNotLeft, toEql(10))
    })

    it('eventually#map monad can Resolve into an either monad', async () => {
      const eventually = Eventually.resolve(5)
      const resolved = await eventually.map(x => Either.right(x * 2))

      resolved.fold(
        isNotReject,
        either => {
          either.fold(isNotLeft, toEql(10))
        },
      )
    })
  })

  describe('identity transformations', () => {

    const toDouble = x => x * 2

    it('maybe of either', () => {
      const maybe = Maybe.of(42)
      const maybeOfEither = maybe.map(x =>
        Either.right(x)
          .map(toDouble),
      )

      const result = maybeOfEither.fold(isNotNone, x => x.fold(isNotLeft, identity))
      expect(result).to.eql(84)
    })

    it('maybe of either v2', () => {
      const maybe = Maybe.of(42)
      const maybeOfEither = maybe.map(Either.right).map(x => x.map(toDouble))

      const result = maybeOfEither.fold(isNotNone, x => x.fold(isNotLeft, identity))
      expect(result).to.eql(84)
    })
  })
})

/**
 * Maybe monad implementation
 * Represents optional values: Some(value) or None
 */

class Some {
  #value

  constructor(value) {
    this.#value = value
  }

  map(fn) {
    return Maybe.of(fn(this.#value))
    // return new Some(fn(this.#value))
  }

  bind(fn) {
    return fn(this.#value)
  }

  fold(_, onSome) {
    return onSome(this.#value)
  }
}

const None = {
  map() {
    return None
  },

  bind() {
    return None
  },

  fold(onNone, _) {
    return onNone()
  },
}

export const Maybe = {
  of: value => value === undefined || value === null? None: new Some(value),
  none: () => None,
}


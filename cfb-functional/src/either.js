/**
 * Either monad implementation
 * Represents values that can be either Left (error/failure) or Right (success)
 */

// eslint-disable-next-line max-classes-per-file
class Left {
  #value

  constructor(value) {
    this.#value = value
  }

  map() {
    return this
  }

  bind() {
    return this
  }

  fold(onLeft, _onRight) {
    return onLeft(this.#value)
  }
}

class Right {
  #value

  constructor(value) {
    this.#value = value
  }

  map(fn) {
    return Either.right(fn(this.#value))
  }

  bind(fn) {
    return fn(this.#value)
  }

  fold(onLeft, onRight) {
    return onRight(this.#value)
  }
}

export const Either = {
  left: value => new Left(value),
  right: value => new Right(value),
}



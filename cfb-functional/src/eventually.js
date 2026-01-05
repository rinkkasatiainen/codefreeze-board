/**
 * Eventually monad implementation
 * Represents values that can be either Reject (error/failure) or Resolve (success)
 * Works with promises, handling both synchronous and asynchronous operations gracefully
 */

// eslint-disable-next-line max-classes-per-file
class Reject {
  #reason

  constructor(reason) {
    this.#reason = reason
  }

  map() {
    return this
  }

  bind() {
    return this
  }

  fold(onReject, _onResolve) {
    return onReject(this.#reason)
  }
}

class Resolve {
  #value

  constructor(value) {
    this.#value = value
  }

  async map(fn) {
    // Map never throws an error -> use bind instead
    try {
      const result = fn(this.#value)
      // If the result is a promise, await it
      if (result && typeof result.then === 'function') {
        const awaited = await result
        return Eventually.resolve(awaited)
      }
      return Eventually.resolve(result)
    } catch (error) {
      console.error('Resolve#map should never throw errors. Use Resolve#bind instead') // eslint-disable-line no-console
      throw error
    }
  }

  async bind(fn) {
    try {
      const result = fn(this.#value)
      // If the result is a promise, await it
      if (result && typeof result.then === 'function') {
        const awaited = await result
        // If the awaited value is an Eventually, return it
        if (awaited && typeof awaited.fold === 'function') {
          return awaited
        }
        // Otherwise wrap the value in Resolve
        return Eventually.resolve(awaited)
      }
      // If fn returns an Eventually directly (has fold method), return it
      if (result && typeof result.fold === 'function') {
        return result
      }
      // Otherwise wrap the value in Resolve
      return Eventually.resolve(result)
    } catch (error) {
      return Eventually.reject(error)
    }
  }

  fold(onReject, onResolve) {
    try {
      const result = onResolve(this.#value)
      // If the result is a promise, return it as-is (fold can return anything)
      if (result && typeof result.then === 'function') {
        return result
      }
      return result
    } catch (error) {
      return onReject(error)
    }
  }
}

export const Eventually = {
  reject: reason => new Reject(reason),
  resolve: value => new Resolve(value),
  fromPromise: promise => promise.then(
    value => Eventually.resolve(value),
    reason => Eventually.reject(reason),
  ),
}


import { expect, use } from 'chai'
import { schemaMatcher } from '../src/chai-helpers.js'

use(schemaMatcher)

describe('schemaMatcher', () => {
  describe('happy flow', () => {
    it('Should validate an object that matches the schema', () => {
      const obj = {
        name: 'John',
        age: 30,
      }

      const schema = {
        name: value => expect(value).to.be.a('string'),
        age: value => expect(value).to.be.a('number'),
      }

      expect(obj).to.matchSchema(schema)
    })

    it('Should validate multiple properties with different validators', () => {
      const obj = {
        id: 123,
        title: 'Test Session',
        isActive: true,
        count: 5,
      }

      const schema = {
        id: value => expect(value).to.be.a('number'),
        title: value => expect(value).to.be.a('string'),
        isActive: value => expect(value).to.be.a('boolean'),
        count: value => expect(value).to.be.greaterThan(0),
      }

      expect(obj).to.matchSchema(schema)
    })
  })

  describe('error messages', () => {
    it('Should provide clear error messages for missing properties', () => {
      const obj = {
        name: 'John',
      }

      const schema = {
        name: value => expect(value).to.be.a('string'),
        age: value => expect(value).to.be.a('number'),
      }

      expect(() => {
        expect(obj).to.matchSchema(schema)
      }).to.throw(/expected .* to have property.*age/)
    })

    it('Should provide clear error messages for extra keys', () => {
      const obj = {
        name: 'John',
        age: 30,
        extra: 'unexpected',
      }

      const schema = {
        name: value => expect(value).to.be.a('string'),
        age: value => expect(value).to.be.a('number'),
      }

      expect(() => {
        expect(obj).to.matchSchema(schema)
      }).to.throw(/expected .* to not have extra keys, but found \[extra\]/)
    })

    it('Should pass custom validator errors with improved error messages', () => {
      const obj = {
        age: 'not a number',
      }

      const schema = {
        age: value => expect(value).to.be.a('number'),
      }

      expect(() => {
        expect(obj).to.matchSchema(schema)
      }).to.throw(/Validation failed for key "age"/)
    })
  })

  describe('missing data', () => {
    it('Should handle empty schemas', () => {
      const obj = {}
      const schema = {}

      expect(obj).to.matchSchema(schema)
    })

    it('Should handle empty objects when schema is empty', () => {
      const obj = {}
      const schema = {}

      expect(obj).to.matchSchema(schema)
    })
  })

  it('Should execute custom validator function for each property', () => {
    let callCount = 0
    const obj = {
      name: 'John',
      age: 30,
    }

    const schema = {
      name: value => {
        callCount++
        expect(value).to.be.a('string')
      },
      age: value => {
        callCount++
        expect(value).to.be.a('number')
      },
    }

    expect(obj).to.matchSchema(schema)
    expect(callCount).to.equal(2)
  })

  it('Should validate all required keys are present in the object', () => {
    const obj = {
      name: 'John',
      age: 30,
      email: 'john@example.com',
    }

    const schema = {
      name: value => expect(value).to.be.a('string'),
      age: value => expect(value).to.be.a('number'),
      email: value => expect(value).to.be.a('string'),
    }

    expect(obj).to.matchSchema(schema)
  })

  it('Should fail when a required property is missing from the object', () => {
    const obj = {
      name: 'John',
    }

    const schema = {
      name: value => expect(value).to.be.a('string'),
      age: value => expect(value).to.be.a('number'),
    }

    expect(() => {
      expect(obj).to.matchSchema(schema)
    }).to.throw()
  })

  it('Should fail when the object has extra keys not in the schema', () => {
    const obj = {
      name: 'John',
      age: 30,
      extraKey: 'should fail',
    }

    const schema = {
      name: value => expect(value).to.be.a('string'),
      age: value => expect(value).to.be.a('number'),
    }

    expect(() => {
      expect(obj).to.matchSchema(schema)
    }).to.throw()
  })

  it('Should check properties using hasOwnProperty to avoid prototype chain', () => {
    const obj = Object.create({ inherited: 'value' })
    obj.own = 'ownValue'

    const schema = {
      own: value => expect(value).to.equal('ownValue'),
    }

    // Should pass because 'inherited' is not an own property
    expect(obj).to.matchSchema(schema)
  })

  it('Should handle validator functions that throw errors', () => {
    const obj = {
      age: 'not a number',
    }

    const schema = {
      age: () => {
        throw new Error('Custom validation error')
      },
    }

    expect(() => {
      expect(obj).to.matchSchema(schema)
    }).to.throw(/Validation failed for key "age": Custom validation error/)
  })

  it('Should pass the property value and key to the validator function', () => {
    let capturedValue
    let capturedKey

    const obj = {
      name: 'John',
    }

    const schema = {
      name: (value, key) => {
        capturedValue = value
        capturedKey = key
      },
    }

    expect(obj).to.matchSchema(schema)
    expect(capturedValue).to.equal('John')
    expect(capturedKey).to.equal('name')
  })

  it('Should validate nested object structures', () => {
    const obj = {
      user: {
        name: 'John',
        age: 30,
      },
    }

    const schema = {
      user: value => {
        expect(value).to.be.an('object')
        expect(value.name).to.be.a('string')
        expect(value.age).to.be.a('number')
      },
    }

    expect(obj).to.matchSchema(schema)
  })

  it('Should work with Chai expect syntax', () => {
    const obj = {
      name: 'John',
    }

    const schema = {
      name: value => expect(value).to.be.a('string'),
    }

    expect(obj).to.matchSchema(schema)
  })

  it('Should handle null values in the object', () => {
    const obj = {
      name: null,
    }

    const schema = {
      name: value => expect(value).to.be.null,
    }

    expect(obj).to.matchSchema(schema)
  })

  it('Should handle undefined values in the object', () => {
    const obj = {
      name: undefined,
    }

    const schema = {
      name: value => expect(value).to.be.undefined,
    }

    expect(obj).to.matchSchema(schema)
  })

  it('Should validate when all validators pass', () => {
    const obj = {
      name: 'John',
      age: 30,
      active: true,
    }

    const schema = {
      name: value => expect(value).to.equal('John'),
      age: value => expect(value).to.equal(30),
      active: value => expect(value).to.be.true,
    }

    expect(obj).to.matchSchema(schema)
  })
})


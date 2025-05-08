import {expect} from 'chai'
import sinon from 'sinon'
import Shell from '../src/shell.js'
import {describe} from 'mocha'

const mockWith = overrides => ({
  configure: () => {
    throw new Error('\'configure\' not supposed to be called')
  },
  activate: () => {
    throw new Error('\'activate\' not supposed to be called')
  },
  run: () => {
    throw new Error('\'run\' not supposed to be called')
  },
  ...overrides,
})

describe('Shell', () => {
  let shell

  beforeEach(() => {
    shell = new Shell()
  })

  describe('configure()', () => {
    it('should call configure on all modules added before configure()', () => {
      const module1 = mockWith({configure: sinon.spy()})
      const module2 = mockWith({configure: sinon.spy()})
      const module3 = mockWith({configure: sinon.spy()})

      shell.addModule(module1)
      shell.addModule(module2)
      shell.addModule(module3)
      shell.configure()

      expect(module1.configure.calledOnce).to.be.true
      expect(module2.configure.calledOnce).to.be.true
      expect(module3.configure.calledOnce).to.be.true
    })

    it('should call configure only once', () => {
      const module1 = mockWith({configure: sinon.spy()})

      shell.addModule(module1)
      shell.configure()
      shell.configure()

      expect(module1.configure.getCalls().length).to.eql(1)
    })
  })

  describe('activate()', () => {
    it('should only call activate on modules that were configured', () => {
      const module1 = mockWith({configure: sinon.spy(), activate: sinon.spy()})
      const module2 = mockWith()

      // Add and configure first module
      shell.addModule(module1)
      shell.configure()

      // Add second module after configure
      shell.addModule(module2)

      shell.activate()

      expect(module1.activate.calledOnce).to.be.true
    })

    it('should call activate only once', () => {
      const module1 = mockWith({configure: sinon.spy(), activate: sinon.spy()})

      shell.addModule(module1)
      shell.configure()
      shell.activate()
      shell.activate()

      expect(module1.activate.getCalls().length).to.eql(1)
    })
  })

  describe('run()', () => {

    it('should only call run on modules that were activated', () => {
      const module1 = mockWith({configure: sinon.spy(), activate: sinon.spy(), run: sinon.spy()})
      const module2 = mockWith({configure: sinon.spy(), activate: sinon.spy(), run: sinon.spy()})

      // Add and configure first module
      shell.addModule(module1)
      shell.configure()
      shell.activate()

      // Add second module after activate
      shell.addModule(module2)

      shell.run()

      expect(module1.run.calledOnce).to.be.true
      expect(module2.run.called).to.be.false
    })

    it('should call run only once', () => {
      const module1 = mockWith({configure: sinon.spy(), activate: sinon.spy(), run: sinon.spy()})

      shell.addModule(module1)
      shell.configure()
      shell.activate()
      shell.run()
      shell.run()
      shell.run()

      expect(module1.run.getCalls().length).to.eql(1)
    })
  })

  it('should maintain proper sequence of operations', () => {
    const module1 = mockWith({
      configure: sinon.spy(),
      activate: sinon.spy(),
      run: sinon.spy(),
    })

    shell.addModule(module1)

    // Should be able to configure
    shell.configure()
    expect(module1.configure.calledOnce).to.be.true

    // Should be able to activate after configure
    shell.activate()
    expect(module1.activate.calledOnce).to.be.true

    // Should be able to run after activate
    shell.run()
    expect(module1.run.calledOnce).to.be.true
  })
})

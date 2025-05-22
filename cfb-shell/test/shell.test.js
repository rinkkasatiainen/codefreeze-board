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
    it('should call configure on all modules added before configure()', async () => {
      const module1 = mockWith({configure: sinon.spy()})
      const module2 = mockWith({configure: sinon.spy()})
      const module3 = mockWith({configure: sinon.spy()})

      await shell.addModule(module1)
      await shell.addModule(module2)
      await shell.addModule(module3)
      await shell.configure()

      expect(module1.configure.calledOnce).to.be.true
      expect(module2.configure.calledOnce).to.be.true
      expect(module3.configure.calledOnce).to.be.true
    })

    it('should call configure only once', async () => {
      const module1 = mockWith({configure: sinon.spy()})

      await shell.addModule(module1)
      await shell.configure()
      await shell.configure()

      expect(module1.configure.getCalls().length).to.eql(1)
    })
  })

  describe('activate()', () => {
    it('should only call activate on modules that were configured', async () => {
      const module1 = mockWith({configure: sinon.spy(), activate: sinon.spy()})
      const module2 = mockWith()

      // Add and configure first module
      await shell.addModule(module1)
      await shell.configure()

      // Add second module after configure
      await shell.addModule(module2)

      await shell.activate()

      expect(module1.activate.calledOnce).to.be.true
    })

    it('should call activate only once', async () => {
      const module1 = mockWith({configure: sinon.spy(), activate: sinon.spy()})

      await shell.addModule(module1)
      await shell.configure()
      await shell.activate()
      await shell.activate()

      expect(module1.activate.getCalls().length).to.eql(1)
    })
  })

  describe('run()', () => {

    it('should only call run on modules that were activated', async () => {
      const module1 = mockWith({configure: sinon.spy(), activate: sinon.spy(), run: sinon.spy()})
      const module2 = mockWith({configure: sinon.spy(), activate: sinon.spy(), run: sinon.spy()})

      // Add and configure first module
      await shell.addModule(module1)
      await shell.configure()
      await shell.activate()

      // Add second module after activate
      await shell.addModule(module2)

      await shell.run()

      expect(module1.run.calledOnce).to.be.true
      expect(module2.run.called).to.be.false
    })

    it('should call run only once', async () => {
      const module1 = mockWith({configure: sinon.spy(), activate: sinon.spy(), run: sinon.spy()})

      await shell.addModule(module1)
      await shell.configure()
      await shell.activate()
      await shell.run()
      await shell.run()
      await shell.run()

      expect(module1.run.getCalls().length).to.eql(1)
    })
  })

  it('should maintain proper sequence of operations', async () => {
    const module1 = mockWith({
      configure: sinon.spy(),
      activate: sinon.spy(),
      run: sinon.spy(),
    })

    await shell.addModule(module1)

    // Should be able to configure
    await shell.configure()
    expect(module1.configure.calledOnce).to.be.true

    // Should be able to activate after configure
    await shell.activate()
    expect(module1.activate.calledOnce).to.be.true

    // Should be able to run after activate
    await shell.run()
    expect(module1.run.calledOnce).to.be.true
  })
})

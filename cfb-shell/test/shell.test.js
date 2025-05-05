import { expect } from 'chai'
import sinon from 'sinon'
import Shell from '../src/shell.js'

describe('Shell', () => {
  let shell
  let module1
  let module2

  beforeEach(() => {
    shell = new Shell()

    // Create mock modules with spies
    module1 = {
      configure: sinon.spy(),
      activate: sinon.spy(),
      run: sinon.spy(),
    }
    module2 = {
      configure: sinon.spy(),
      activate: sinon.spy(),
      run: sinon.spy(),
    }
  })

  it('should add modules', () => {
    shell.addModule(module1)
    shell.addModule(module2)

    // Internal check: you might want to expose a way to get modules for testing,
    // or just rely on behavior in other tests.
    expect(shell.modules).to.include(module1)
    expect(shell.modules).to.include(module2)
  })

  it('should call configure on all modules', () => {
    shell.addModule(module1)
    shell.addModule(module2)

    shell.configure()

    expect(module1.configure.calledOnce).to.be.true
    expect(module2.configure.calledOnce).to.be.true
  })

  it('should call activate on all modules', () => {
    shell.addModule(module1)
    shell.addModule(module2)

    shell.activate()

    expect(module1.activate.calledOnce).to.be.true
    expect(module2.activate.calledOnce).to.be.true
  })

  it('should call run on all modules', () => {
    shell.addModule(module1)
    shell.addModule(module2)

    shell.run()

    expect(module1.run.calledOnce).to.be.true
    expect(module2.run.calledOnce).to.be.true
  })
})

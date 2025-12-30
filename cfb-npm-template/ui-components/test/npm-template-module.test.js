import {expect} from 'chai'
import {spy} from 'sinon'
import {NpmTemplateModule} from '../src/npm-template-module.js'
import {CfbExampleElement} from '../src/components/cfb-example.js'
import exampleStorage from '../src/storage/example-storage.js'

describe('NpmTemplateModule', () => {
  let module = null
  let testRoot = null
  let defineElementSpy = null

  before(() => {
    module = new NpmTemplateModule()
  })

  beforeEach(() => {
    testRoot = document.createElement('div')
    testRoot.id = 'test-root'
    document.body.appendChild(testRoot)
  })

  afterEach(() => {
    document.querySelectorAll('#test-root').forEach(el => el.remove())
    if(defineElementSpy){
      defineElementSpy.restore()
    }
  })

  describe('configure', () => {
    describe('initializes storage', () => {
      before(async () => {
        // Monkey patch exampleStorage to add clearAll method
        exampleStorage.clearAll = async function() {
          const examples = await this.getAllExamples()
          const deletePromises = examples.map(example => this.deleteExample(example.id))
          await Promise.all(deletePromises)
        }
        await module.configure(module)
      })

      after(async () => {
        // Remove the monkey patch
        delete exampleStorage.clearAll
      })

      beforeEach(async () => {
        await exampleStorage.clearAll()
      })

      it('does not have anything when initialized', async () => {
        const shouldBeEmpty = await exampleStorage.getAllExamples()

        expect(shouldBeEmpty.length).to.be.eql(0)
      })

      it('should be able to store item', async () => {
        await exampleStorage.addExample({id: 'example', foo: 'bar'})

        const examples = await exampleStorage.getAllExamples()

        expect(examples.length).to.be.gte(1)
        // expect(examples).to.be.eql([{id: 'example', foo: 'bar'}])
      })
    })
  })

  describe('activate', () => {

  })

  describe('run', () => {
    beforeEach(() => {
      defineElementSpy = spy(customElements, 'define')
    })

    afterEach(() => {
      defineElementSpy.restore()
    })

    it('should define element', () => {
      module.run()

      expect(defineElementSpy.callCount).to.eql(2)
    })

    it('should define element only once', () => {
      if (customElements.get(CfbExampleElement.elementName)) {
        module.run()
        expect(defineElementSpy.called).to.be.false
      } else {
        module.run()
        module.run()
        expect(defineElementSpy.calledOnce).to.be.true
      }
    })
  })
})

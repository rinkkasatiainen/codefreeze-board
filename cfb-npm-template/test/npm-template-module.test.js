import {expect} from 'chai'
import {NpmTemplateModule} from '../src/npm-template-module.js'
import {CfbExampleElement} from '../src/components/cfb-example.js'
import {spy} from 'sinon'

describe('NpmTemplateModule', () => {
  let module = null
  let testRoot = null
  let defineElementSpy = null

  beforeEach(() => {
    module = new NpmTemplateModule()
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

      expect(defineElementSpy.calledOnce).to.be.true
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

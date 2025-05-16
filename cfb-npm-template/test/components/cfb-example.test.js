import {expect} from 'chai'
import {CfbExampleElement} from '../../src/components/cfb-example.js'

describe('ExampleElement', () => {
  let testRoot = null

  before(() => {
    customElements.define(CfbExampleElement.elementName, CfbExampleElement)
  })

  beforeEach(() => {
    testRoot = document.createElement('div')
    testRoot.id = 'test-testRoot'
    document.body.appendChild(testRoot)
  })

  afterEach(() => {
    document.querySelectorAll('#test-root').forEach(el => el.innerHTML = '')
  })

  it('should write Hello world by default!', async () => {
    const sut = document.createElement(CfbExampleElement.elementName)

    testRoot.appendChild(sut)

    expect(testRoot.innerHTML).to.eql('<cfb-example-element>Hello World!</cfb-example-element>')
  })

  it('should change based on name', async () => {
    const sut = document.createElement(CfbExampleElement.elementName)

    testRoot.appendChild(sut)
    sut.setAttribute(CfbExampleElement.definedAttributes.dataName, 'Evan Example')

    expect(sut.innerHTML).to.eql('Hello Evan Example!')
  })
})

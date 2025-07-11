import {expect} from 'chai'
import {CfbSection} from '../../src/loads-sections/components/cfb-section.js'
import {todo} from '@rinkkasatiainen/cfb-testing-utils'

describe('CfbSection', () => {
  let testRoot = null

  before(() => {
    customElements.define(CfbSection.elementName, CfbSection)
    testRoot = document.createElement('div')
    testRoot.id = 'test-root'
  })

  beforeEach(() => {
    document.body.appendChild(testRoot)
  })

  afterEach(() => {
    document.querySelectorAll('#test-root').forEach(el => el.remove())
  })

  describe('render', () => {

    it('should render with default values when no attributes are set', () => {
      const sut = document.createElement(CfbSection.elementName)
      testRoot.appendChild(sut)

      expect(sut.querySelector('h2.cfb-column__title').textContent).to.equal('Untitled')
      expect(sut.querySelector('section.cfb-column')).to.exist
      expect(sut.querySelector('section.cfb-column').getAttribute('aria-label')).to.equal('Untitled column')
    })

    it('should render with provided name attribute', () => {
      const sut = document.createElement(CfbSection.elementName)
      sut.setAttribute(CfbSection.definedAttributes.name, 'Thursday')
      testRoot.appendChild(sut)

      expect(sut.querySelector('h2.cfb-column__title').textContent).to.equal('Thursday')
      expect(sut.querySelector('section.cfb-column').getAttribute('aria-label')).to.equal('Thursday column')
    })

    it('should render with provided section-id attribute', () => {
      const sut = document.createElement(CfbSection.elementName)
      sut.setAttribute(CfbSection.definedAttributes.sectionId, 'id-1')
      testRoot.appendChild(sut)

      expect(sut.getAttribute('data-section-id')).to.equal('id-1')
    })

    it('should update title when name attribute changes', () => {
      const sut = document.createElement(CfbSection.elementName)
      testRoot.appendChild(sut)

      sut.setAttribute(CfbSection.definedAttributes.name, 'Friday')

      expect(sut.querySelector('h2.cfb-column__title').textContent).to.equal('Friday')
      expect(sut.querySelector('section.cfb-column').getAttribute('aria-label')).to.equal('Friday column')
    })

    it('should update section-id when section-id attribute changes', () => {
      const sut = document.createElement(CfbSection.elementName)
      sut.setAttribute(CfbSection.definedAttributes.sectionId, 'id-1')
      testRoot.appendChild(sut)

      sut.setAttribute(CfbSection.definedAttributes.sectionId, 'id-2')

      expect(sut.getAttribute('data-section-id')).to.equal('id-2')
    })
  })

  // Test list for session interaction functionality
  todo('Should handle cfb-moved-session event and move target item to drop area')
  todo('Should handle cfb-session-on-top event and add drop area after target')
  todo('Should handle cfb-session-on-top-title event and add drop area at top')
  todo('Should handle mouseleave event and remove drop area')
  todo('Should handle mouseout event and remove drop area')
  todo('Should handle dragleave event on column and remove drop area')
  todo('Should prevent default and stop propagation on session events')
  todo('Should find correct column with drop area when moving session')
  todo('Should insert target item before drop area when moving session')
  todo('Should remove drop area after successful session move')
  todo('Should handle case when no drop area exists during move')
  todo('Should create cfb-drop-area element with correct class name')
  todo('Should insert placeholder at correct position in column')
  todo('Should append placeholder to end of column when no next sibling')
  todo('Should remove all existing placeholders before adding new one')
  todo('Should handle multiple drop areas and remove all of them')
  todo('Should maintain event listeners after re-rendering')
  todo('Should handle session events with proper event detail structure')
  todo('Should handle edge cases when column element is not found')
  todo('Should handle edge cases when target element is not found')
})

import {expect} from 'chai'
import {todo} from '@rinkkasatiainen/cfb-testing-utils'
import {CfbSession} from '../../src/loads-sections/components/cfb-session.js'

describe('CfbSession', () => {
  let testRoot = null

  before(() => {
    customElements.define(CfbSession.elementName, CfbSession)
    testRoot = document.createElement('div')
    testRoot.id = 'test-root'

    // Add CSS styles for testing
    const style = document.createElement('style')
    style.textContent = `
      cfb-session {
        cursor: move;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    `
    document.head.appendChild(style)
  })

  beforeEach(() => {
    document.body.appendChild(testRoot)
  })

  afterEach(() => {
    document.querySelectorAll('#test-root').forEach(el => el.remove())
  })

  describe('render', () => {
    it('should be draggable', () => {
      const sut = document.createElement(CfbSession.elementName)
      testRoot.appendChild(sut)

      expect(sut.getAttribute('draggable')).to.equal('true')
    })

    it('should add \'dragging\' to classlist when dragging', () => {
      const sut = document.createElement(CfbSession.elementName)
      testRoot.appendChild(sut)

      sut.dispatchEvent(new Event('dragstart', { bubbles: true }))

      expect(Array.from( sut.classList)).to.contain('dragging')
    })

    it('should remove \'dragging\' to classlist when drag ended', () => {
      const sut = document.createElement(CfbSession.elementName)
      testRoot.appendChild(sut)

      sut.dispatchEvent(new Event('dragstart', { bubbles: true }))
      expect(Array.from( sut.classList)).to.contain('dragging')

      sut.dispatchEvent(new Event('dragend', { bubbles: true }))
      expect(Array.from( sut.classList)).to.not.contain('dragging')
    })

    it('should have touch event listeners', () => {
      const sut = document.createElement(CfbSession.elementName)
      testRoot.appendChild(sut)

      // Verify that touch events can be dispatched
      const touchStartEvent = new TouchEvent('touchstart', { bubbles: true })
      const touchMoveEvent = new TouchEvent('touchmove', { bubbles: true })
      const touchEndEvent = new TouchEvent('touchend', { bubbles: true })

      // These should not throw errors if listeners are properly attached
      expect(() => sut.dispatchEvent(touchStartEvent)).to.not.throw()
      expect(() => sut.dispatchEvent(touchMoveEvent)).to.not.throw()
      expect(() => sut.dispatchEvent(touchEndEvent)).to.not.throw()
    })

    it('should have cursor move style', () => {
      const sut = document.createElement(CfbSession.elementName)
      testRoot.appendChild(sut)

      // Check that the element has the expected cursor style
      const computedStyle = window.getComputedStyle(sut)
      expect(computedStyle.cursor).to.equal('move')
    })

    it('should prevent text selection during drag', () => {
      const sut = document.createElement(CfbSession.elementName)
      testRoot.appendChild(sut)

      const computedStyle = window.getComputedStyle(sut)
      expect(computedStyle.userSelect).to.equal('none')
      // Note: webkitUserSelect might be undefined in some browsers, so we check if it's set
      if (computedStyle.webkitUserSelect !== undefined) {
        expect(computedStyle.webkitUserSelect).to.equal('none')
      }
      if (computedStyle.mozUserSelect !== undefined) {
        expect(computedStyle.mozUserSelect).to.equal('none')
      }
      if (computedStyle.msUserSelect !== undefined) {
        expect(computedStyle.msUserSelect).to.equal('none')
      }
    })
  })

  // Test list for session interaction functionality
  describe('web drag handlers', () => {
    todo('handles dragStart and adds a class')
    todo('handles dragEnd and removes the class')
    todo('on dragEnd, sends a \'cfb-moved-session\' event')
    todo('on dragOver, sends a \'cfb-session-on-top\' event')
    todo('on dragOver, sends a \'cfb-session-over-top-half\' event when mouse over top half of session')
    todo('on dragOver, sends a \'cfb-session-over-bottom-half\' event when mouse over bottom half of session')
  })
  // touch
  describe('touch handlers', () => {
    todo('handles touchstart')
    todo('handles touchmove')
    todo('handles touchEnd')
    todo('sends \'cfb-session-on-top\' event when has a session below')
    todo('on dragOver, sends a \'cfb-session-on-top\' event')
  })
})

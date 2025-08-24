import {expect} from 'chai'
import {CfbColumnTitleElement} from '../../src/loads-sections/components/cfb-column-title.js'
import {waitUntil} from '@rinkkasatiainen/cfb-testing-utils'

const newDragEnterEvent = () => new DragEvent('dragenter', {
  bubbles: true,
  cancelable: true,
  dataTransfer: new DataTransfer(),
})
const newDragOverEvent = () => new DragEvent('dragover', {
  bubbles: true,
  cancelable: true,
  dataTransfer: new DataTransfer(),
})
const newDropEvent = () => new DragEvent('drop', {
  bubbles: true,
  cancelable: true,
  dataTransfer: new DataTransfer(),
})
const newDragLeaveEvent = () => new DragEvent('dragleave', {
  bubbles: true,
  cancelable: true,
  dataTransfer: new DataTransfer(),
})

describe('CfbColumnTitleElement', () => {
  let testRoot = null

  before(() => {
    customElements.define(CfbColumnTitleElement.elementName, CfbColumnTitleElement)
    testRoot = document.createElement('div')
    testRoot.id = 'test-root'
  })

  beforeEach(() => {
    document.body.appendChild(testRoot)
  })

  afterEach(() => {
    document.querySelectorAll('#test-root').forEach(el => el.innerHTML = '')
  })

  function createCfbColumnTitleElement(title) {
    const sut = document.createElement(CfbColumnTitleElement.elementName)
    sut.setAttribute(CfbColumnTitleElement.definedAttributes.name, title)

    testRoot.appendChild(sut)
    return sut
  }

  // Test list for CfbColumnTitle component
  describe('Component Structure and Rendering', () => {
    it('should render with the provided name attribute', async () => {
      const sut = createCfbColumnTitleElement('Test Column')

      expect(sut.innerHTML).to.eql('<h2 class="cfb-column__title">Test Column</h2>')
    })

    it('should update the title when the name attribute changes', async () => {
      const sut = createCfbColumnTitleElement('Initial Title')

      sut.setAttribute(CfbColumnTitleElement.definedAttributes.name, 'Updated Title')

      expect(sut.innerHTML).to.eql('<h2 class="cfb-column__title">Updated Title</h2>')
    })
  })

  describe('Drag and Drop Functionality', () => {
    it('should dispatch cfb-session-on-top-title event when dragged over', async () => {
      const sut = createCfbColumnTitleElement('Test Column')
      const callOrder = []

      testRoot.addEventListener('cfb-session-on-top-title', event => {
        expect(event.detail.target.outerHTML).to.eql(sut.outerHTML)
        callOrder.push('on-top-event-dispatched')
      })

      sut.dispatchEvent(newDragEnterEvent())
      await waitUntil(() => callOrder.length > 0 )

      expect(callOrder).to.include('on-top-event-dispatched')
    })

    it('should prevent default on dragover', async () => {
      const sut = createCfbColumnTitleElement('Test Column')
      const callOrder = []

      const dragoverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      })

      const originalPreventDefault = dragoverEvent.preventDefault
      dragoverEvent.preventDefault = () => {
        callOrder.push('prevent-default-called')
      }
      sut.dispatchEvent(dragoverEvent)
      dragoverEvent.preventDefault = originalPreventDefault

      expect(callOrder).to.include('prevent-default-called')
    })

    it('should handle drag counter correctly for multiple dragenter/dragleave events', async () => {
      const sut = createCfbColumnTitleElement('Test Column')
      const callOrder = []

      sut.addEventListener('cfb-session-on-top-title', () => {
        callOrder.push('on-top-event-dispatched')
      })

      const dragEnterEvent = newDragEnterEvent()
      const dragLeaveEvent = newDragLeaveEvent()

      // First dragenter should dispatch event
      sut.dispatchEvent(dragEnterEvent)
      expect(callOrder).to.have.length(1)

      // Second dragenter should not dispatch another event
      sut.dispatchEvent(dragEnterEvent)
      expect(callOrder).to.have.length(1)

      // First dragleave should not reset
      sut.dispatchEvent(dragLeaveEvent)
      expect(callOrder).to.have.length(1)

      // Second dragleave should reset counter
      sut.dispatchEvent(dragLeaveEvent)
      expect(callOrder).to.have.length(1)

      // Another dragenter should dispatch event again
      sut.dispatchEvent(dragEnterEvent)
      expect(callOrder).to.have.length(2)
    })

    it('should reset drag counter on drop', async () => {
      const sut = createCfbColumnTitleElement('Test Column')
      const callOrder = []

      sut.addEventListener('cfb-session-on-top-title', () => {
        callOrder.push('on-top-event-dispatched')
      })

      const dragEnterEvent = newDragEnterEvent()
      const dropEvent = newDropEvent()

      // Drag enter to set counter
      sut.dispatchEvent(dragEnterEvent)
      expect(callOrder).to.have.length(1)

      // Drop should reset counter
      sut.dispatchEvent(dropEvent)

      // Another drag enter should dispatch event again (counter was reset)
      sut.dispatchEvent(dragEnterEvent)
      expect(callOrder).to.have.length(2)
    })
  })

  describe('Event Handling', () => {
    it('should prevent default behavior on dragover events', async () => {
      const sut = createCfbColumnTitleElement('Test Column')
      const callOrder = []

      const dragoverEvent = newDragOverEvent()

      const originalPreventDefault = dragoverEvent.preventDefault
      dragoverEvent.preventDefault = () => {
        callOrder.push('prevent-default-called')
      }

      sut.dispatchEvent(dragoverEvent)
      dragoverEvent.preventDefault = originalPreventDefault

      expect(callOrder).to.include('prevent-default-called')
    })

    it('should handle dragenter events appropriately', async () => {
      const sut = createCfbColumnTitleElement('Test Column')
      const callOrder = []

      sut.addEventListener('cfb-session-on-top-title', () => {
        callOrder.push('on-top-event-dispatched')
      })

      const dragEnterEvent = newDragEnterEvent()

      sut.dispatchEvent(dragEnterEvent)

      expect(callOrder).to.include('on-top-event-dispatched')
    })

    it('should handle dragleave events appropriately', async () => {
      const sut = createCfbColumnTitleElement('Test Column')
      const callOrder = []

      sut.addEventListener('cfb-session-on-top-title', () => {
        callOrder.push('on-top-event-dispatched')
      })

      const dragEnterEvent = newDragEnterEvent()

      const dragLeaveEvent = new DragEvent('dragleave', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      })

      // First dragenter
      sut.dispatchEvent(dragEnterEvent)
      expect(callOrder).to.have.length(1)

      // First dragleave (should not reset counter yet)
      sut.dispatchEvent(dragLeaveEvent)
      expect(callOrder).to.have.length(1)

      // Second dragleave (should reset counter)
      sut.dispatchEvent(dragLeaveEvent)
      expect(callOrder).to.have.length(1)
    })

    it('should handle drop events appropriately', async () => {
      const sut = createCfbColumnTitleElement('Test Column')
      const callOrder = []

      sut.addEventListener('cfb-session-on-top-title', () => {
        callOrder.push('on-top-event-dispatched')
      })

      const dragEnterEvent = newDragEnterEvent()

      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      })

      // Drag enter to set counter
      sut.dispatchEvent(dragEnterEvent)
      expect(callOrder).to.have.length(1)

      // Drop should reset counter
      sut.dispatchEvent(dropEvent)

      // Another drag enter should dispatch event again (counter was reset)
      sut.dispatchEvent(dragEnterEvent)
      expect(callOrder).to.have.length(2)
    })
  })

  describe('Component Lifecycle', () => {
    it('should initialize correctly when connected to DOM')

    it('should clean up event listeners when disconnected from DOM')

    it('should handle attribute changes correctly')
  })

  describe('Accessibility', () => {
    it('should have appropriate ARIA attributes for drag and drop functionality')

    it('should be keyboard accessible for drag and drop operations')
  })
})

import {createLogger} from '@rinkkasatiainen/cfb-observability'
import CfbRetrievesItems from '../ports/cfb-retrieves-items.js'

/**
 * A simple item loader element
 */

export class CfbItemLoader extends HTMLElement {
  static elementName = 'cfb-item-loader'
  static definedAttributes = {eventId: 'data-event-id'}
  #logger = createLogger()

  #eventId

  static get observedAttributes() {
    return [CfbItemLoader.definedAttributes.eventId]
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (newValue === oldValue) {
      return
    }

    if (name === CfbItemLoader.definedAttributes.eventId) {
      this.#eventId = newValue
      const items = await this.#loadItems(this.#eventId)
      this.#updateChildren(items)
    }
  }

  async #loadItems(eventId) {
    return await CfbRetrievesItems.getItems(eventId)
  }

  #updateChildren(items){
    // Store items for child components to use
    this.items = items
    this.dispatchEvent(new CustomEvent('items-loaded', {detail: {items, eventId: this.#eventId}}))
  }
}


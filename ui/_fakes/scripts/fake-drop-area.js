import {CFBSession} from './fake-session.js'

export class CFBDropArea extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('dragover', this.handleDragOver.bind(this))
  }

  handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    return false
  }
}
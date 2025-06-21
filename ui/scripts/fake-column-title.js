import {CFBSession} from './fake-session.js'

export class CFBColumnTitle extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('dragover', this.handleDragOver.bind(this));
    this.addEventListener('drop', this.handleDrop.bind(this));
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (CFBSession.draggedItem) {
      // Create the same event that a cfb-session would dispatch on hover
      const onTopEvent = new CustomEvent('cfb-session-on-top', {
        bubbles: true,
        composed: true,
        detail: {
          session: CFBSession.draggedItem,
          newPosition: -1, // Position at the beginning of the column
          target: this
        }
      });
      this.dispatchEvent(onTopEvent);
    }
    return false;
  }

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    if (CFBSession.draggedItem) {
      // Create the same event that a cfb-session would dispatch on drop
      const movedEvent = new CustomEvent('cfb-moved-session', {
        bubbles: true,
        composed: true,
        detail: {
          session: CFBSession.draggedItem,
          newPosition: 0, // Position at the beginning of the column
          target: this.closest('.cfb-column').querySelector('cfb-session') || this
        }
      });
      this.dispatchEvent(movedEvent);
    }
    return false;
  }
}

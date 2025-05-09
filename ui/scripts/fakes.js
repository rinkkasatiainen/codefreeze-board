class CFBSection extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('cfb-move-session', this.handleSessionMove.bind(this))
    this.addEventListener('cfb-moved-session', this.handleSessionMoved.bind(this))
  }

  handleSessionMove(e) {
  }

  handleSessionMoved(e) {
    e.preventDefault()
    e.stopPropagation()
    const target = e.target

    const draggedItem = e.detail.session
    const targetItem = e.detail.target
    const column = this.querySelector('.cfb-column')
    const sessions = Array.from(column.querySelectorAll('.cfb-session'))
    const draggedIndex = sessions.indexOf(draggedItem)
    const droppedIndex = e.detail.newPosition

    if (draggedIndex < droppedIndex) {
      column.insertBefore(draggedItem, targetItem)
    } else {
      column.insertBefore(draggedItem, target)
    }

    return false
  }
}

class CFBSession extends HTMLElement {
  static draggedItem = null;

  constructor() {
    super()
    
    // Use arrow functions to maintain 'this' context
    this.handleDragStart = (e) => {
      CFBSession.draggedItem = this;
      this.style.opacity = '0.5';
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', this.innerHTML);

      console.log('starting here, session', this, CFBSession.draggedItem);
      // Dispatch custom event for move start
      const moveEvent = new CustomEvent('cfb-move-session', {
        bubbles: true,
        composed: true,
        detail: { session: this }
      });
      this.dispatchEvent(moveEvent);
    }

    this.handleDragEnd = (e) => {
      this.style.opacity = '1';
      document.querySelectorAll('.cfb-session').forEach(session => {
        session.classList.remove('over');
      });
      CFBSession.draggedItem = null;
    }

    this.handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      return false;
    }

    this.handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target;

      console.log('drop', this, e, e.target, e.toElement);

      if (CFBSession.draggedItem !== this) {
        const column = this.closest('.cfb-column');
        const sessions = Array.from(column.querySelectorAll('.cfb-session'));
        const droppedIndex = sessions.indexOf(target);

        // Dispatch custom event for move completion
        const movedEvent = new CustomEvent('cfb-moved-session', {
          bubbles: true,
          composed: true,
          detail: {
            session: CFBSession.draggedItem,
            newPosition: droppedIndex,
            target: this
          }
        });
        this.dispatchEvent(movedEvent);
      }

      return false;
    }
  }

  connectedCallback() {
    this.setAttribute('draggable', 'true')
    this.addEventListener('dragstart', this.handleDragStart)
    this.addEventListener('dragend', this.handleDragEnd)
    this.addEventListener('dragover', this.handleDragOver)
    this.addEventListener('drop', this.handleDrop)
  }
}

export class FakeModule {
  configure() {
    customElements.define('cfb-section', CFBSection)
    customElements.define('cfb-session', CFBSession)
  }

  activate() {
    // Empty activation method
  }

  run() {
    // Empty run method
  }
}



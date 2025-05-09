class CFBSection extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('cfb-move-session', this.handleSessionMove.bind(this))
    this.addEventListener('cfb-moved-session', this.handleSessionMoved.bind(this))
    this.addEventListener('cfb-session-on-top', this.handleSessionOnTop.bind(this))
    this.addEventListener('mouseout', this.handleSessionHoverOff.bind(this))
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

    // Remove any existing placeholder
    this.removePlaceholder();
    // TODO: remove all placeholders

    return false
  }

  spot = null;

  handleSessionOnTop(e) {
    e.preventDefault();
    e.stopPropagation();

    const target = e.detail.target;
    if(target === this.spot) {
      return;
    }

    this.spot = target;
    const column = this.querySelector('.cfb-column');
    
    // Remove any existing placeholder first
    this.removePlaceholder();

    // Create new placeholder
    const placeholder = document.createElement('cfb-drop-area');
    placeholder.className = 'cfb-session-placeholder';
    
    // Insert placeholder at the target position
    if (target.nextSibling) {
      column.insertBefore(placeholder, target.nextSibling);
    } else {
      column.appendChild(placeholder);
    }

    return false;
  }

  handleSessionHoverOff(e) {
    if(e.target === this) {
      console.log('hover off', e)
      this.removePlaceholder();
    }
    }

  removePlaceholder() {
    const existingPlaceholders = document.querySelectorAll('.cfb-session-placeholder');
    existingPlaceholders.forEach(placeholder => {
      placeholder.remove();
    });
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
      this.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', this.innerHTML);

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
      this.classList.remove('dragging');
      document.querySelectorAll('.cfb-session').forEach(session => {
        session.classList.remove('over');
      });
      CFBSession.draggedItem = null;
    }

    this.handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      // Dispatch on-top event
      const onTopEvent = new CustomEvent('cfb-session-on-top', {
        bubbles: true,
        composed: true,
        detail: {
          session: this,
          newPosition: 0,  // Initial position
          target: this
        }
      });
      this.dispatchEvent(onTopEvent);
      return false;
    }

    this.handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target;

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

class CFBDropArea extends HTMLElement {
    static get observedAttributes() {
        return ['data-index'];
    }

    constructor() {
        super();
        this.addEventListener('dragover', this.handleDragOver.bind(this));
        this.addEventListener('drop', this.handleDrop.bind(this));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-index') {
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        // Dispatch custom event for move completion
        const movedEvent = new CustomEvent('cfb-moved-session', {
            bubbles: true,
            composed: true,
            detail: {
                session: CFBSession.draggedItem,
                newPosition: parseInt(this.getAttribute('data-index'), 10),
                target: this
            }
        });
        this.dispatchEvent(movedEvent);

        return false;
    }
}

export class FakeModule {
  configure() {
    customElements.define('cfb-section', CFBSection)
    customElements.define('cfb-session', CFBSession)
    customElements.define('cfb-drop-area', CFBDropArea)
  }

  activate() {
    // Empty activation method
  }

  run() {
    // Empty run method
  }
}



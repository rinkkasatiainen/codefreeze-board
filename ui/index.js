// Board component - main container
class Board extends HTMLElement {
    constructor() {
        super();
        this.classList.add('board');
    }
}

// Column component - represents a single column
class Column extends HTMLElement {
    constructor() {
        super();
        this.classList.add('column');
    }
}

// Card component - represents a single card
class Card extends HTMLElement {
    constructor() {
        super();
        this.classList.add('card');
    }
}

// Register the components
customElements.define('trello-board', Board);
customElements.define('trello-column', Column);
customElements.define('trello-card', Card);

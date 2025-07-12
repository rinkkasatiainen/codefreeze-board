import {renderBoard} from './board.render.js'

export default {
  title: '  Board/board',
  parameters: {
    docs: {
      description: {
        component: 'The board UI layout'
      }
    }
  }
}

// Default story - basic component
export const Default = {
  render: renderBoard,
  args: {}
}
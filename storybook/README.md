# CFB Storybook

This is a Storybook instance for showcasing CFB (CodeFreeze Board) components and modules.

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start Storybook in development mode:
```bash
npm run storybook
```

3. Open your browser and navigate to `http://localhost:6006`

### Building for Production

To build a static version of Storybook:

```bash
npm run build-storybook
```

The built files will be in the `storybook-static` directory.

## Available Stories

### Template Components

- **CFB Example Element**: A simple web component that displays a greeting message
  - Default: Shows the component with default "World" greeting
  - Custom Name: Shows the component with a custom name
  - Empty Name: Shows the component with an empty name
  - Interactive: Allows real-time editing of the name attribute

- **Storage Demo**: Demonstrates the IndexedDB storage functionality
  - Add random examples to the database
  - Retrieve all stored examples
  - Clear all data from storage

- **CFB Session Discovery**:
  - **Schedule Loader**: Web component that loads schedule sections for events
    - Default: Basic component without event ID
    - With Event ID: Component with predefined event ID
    - Interactive: Real-time event ID input and loading
  - **Schedule**: Web component that displays sections from IndexedDB
    - Default: Basic component without attributes
    - With Event ID: Component with predefined event ID
    - Interactive: Real-time event ID input, section addition, and updates
  - **Storage Demo**: Schedule section storage functionality
    - Add sample sections for events
    - Retrieve sections by event ID
    - Clear sections from storage

### Default Examples

- **Button**: Various button styles and states
- **Header**: Page header with login/logout functionality
- **Page**: Complete page layout example

## Adding New Components

To add stories for new components:

1. Create a new `.stories.js` file in the appropriate directory:
   - `stories/template/` for CFB template components
   - `stories/default/` for example/demo components
2. Import your component and register it as a custom element
3. Define the story configuration with title, parameters, and argTypes
4. Create story exports for different states/variants

Example:

```javascript
import {YourComponent} from '@your-package/your-component'

// Register the custom element
if (!customElements.get(YourComponent.elementName)) {
  customElements.define(YourComponent.elementName, YourComponent)
}

export default {
  title: 'Your Category/Component Name',
  component: YourComponent.elementName,
  // ... configuration
}

export const Default = {
  args: {},
  render: (args) => {
    const element = document.createElement(YourComponent.elementName)
    // ... setup
    return element
  }
}
```

## Configuration

Storybook configuration is in the `.storybook/` directory:

- `main.js`: Main configuration file
- `preview.js`: Global parameters and decorators

## Contributing

When adding new stories:

1. Follow the existing naming conventions
2. Include proper documentation in the story parameters
3. Test that the stories work correctly
4. Update this README if adding new categories 
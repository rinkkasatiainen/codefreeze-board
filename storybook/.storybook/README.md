# Storybook Configuration

This directory contains the Storybook configuration files.

## Files

### `main.js`
- Main Storybook configuration
- Defines story locations and addons

### `preview.js`
- Storybook preview configuration
- Controls, parameters, and story-level settings

### `preview-head.html`
- **Global HTML head configuration**
- Loaded before each story
- Perfect for:
  - CSS imports
  - Import mapping
  - Mock Service Worker setup
  - Global configurations

## CSS Integration

The `preview-head.html` file imports CSS from the `@rinkkasatiainen/cfb-session-discovery` package:

```html
<link rel="stylesheet" href="../node_modules/@rinkkasatiainen/cfb-session-discovery/css/styles.css">
```

This ensures that all component styles are available in Storybook stories.

## Future Enhancements

### Import Mapping
The import map is already configured for future use:

```html
<script type="importmap">
  {
    "imports": {
      "@rinkkasatiainen/cfb-session-discovery": "../node_modules/@rinkkasatiainen/cfb-session-discovery/index.js"
    }
  }
</script>
```

### Mock Service Worker
Ready for future implementation to mock API calls:

```html
<script>
  // Mock Service Worker configuration
  // - Mock API endpoints for schedule data
  // - Mock IndexedDB operations
  // - Mock event dispatching
</script>
```

## Usage

1. **Adding new CSS**: Add `<link>` tags to `preview-head.html`
2. **Adding import mappings**: Update the import map in `preview-head.html`
3. **Adding mocks**: Uncomment and configure the Mock Service Worker section
4. **Global styles**: Add to the `<style>` section in `preview-head.html`

## Benefits of preview-head.html

- ✅ **Global scope**: Available to all stories
- ✅ **Early loading**: Loaded before story execution
- ✅ **Flexible**: Can include any HTML head content
- ✅ **Maintainable**: Centralized configuration
- ✅ **Future-proof**: Easy to add new features 
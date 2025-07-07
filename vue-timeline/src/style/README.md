# Timeline JS 3 - PostCSS Style Structure

This directory contains the organized PostCSS styles for Timeline JS 3, structured for better maintainability and incorporating UnoCSS @apply directives where possible.

## Directory Structure

```
src/style/
├── index.css              # Main entry point - imports all styles
├── main.css               # Legacy file - now imports index.css
├── timeline.css           # Original timeline styles (kept for reference)
├── base/
│   ├── variables.css      # CSS custom properties (converted from LESS variables)
│   └── typography.css     # Typography styles with UnoCSS utilities
├── layout/
│   └── timeline.css       # Main timeline layout and structure
├── components/
│   ├── buttons.css        # Button components
│   ├── media.css          # Media display components
│   ├── menubar.css        # Menu bar navigation
│   ├── message.css        # Message and notification components
│   ├── storyslider.css    # Story content slider
│   ├── timeera.css        # Historical era background spans
│   ├── timemarker.css     # Individual event markers
│   ├── timenav.css        # Time navigation controls
│   └── vcard.css          # Social media card components
├── utilities/
│   ├── animations.css     # Animation utilities and states
│   └── helpers.css        # Utility classes for common patterns
└── themes/
    └── default.css        # Theme variations (dark mode, high contrast)
```

## Features

### PostCSS Native Nesting
- Uses modern CSS nesting syntax instead of LESS
- Maintains the same component hierarchy and structure
- Compatible with PostCSS nesting plugin

### UnoCSS Integration
- Incorporates `@apply` directives for common utility patterns
- Uses Tailwind-like utility classes for spacing, colors, and layout
- Reduces custom CSS where standard utilities suffice

### CSS Custom Properties
- Converted LESS variables to CSS custom properties
- Enables runtime theme switching
- Better browser compatibility and performance

### Modular Architecture
- Separated concerns into logical component files
- Easy to maintain and extend individual components
- Clear import structure for selective loading

## Usage

### Import Everything
```css
@import './src/style/index.css';
```

### Import Specific Components
```css
@import './src/style/base/variables.css';
@import './src/style/components/timemarker.css';
@import './src/style/utilities/animations.css';
```

### Theme Support
```css
/* Include default theme */
@import './src/style/themes/default.css';
```

## UnoCSS Utilities Used

The styles incorporate UnoCSS @apply directives for:

- **Layout**: `@apply flex flex-col relative absolute`
- **Spacing**: `@apply p-4 m-2 mb-4 mt-1`
- **Typography**: `@apply text-sm font-bold leading-tight`
- **Colors**: `@apply text-gray-600 bg-white`
- **Effects**: `@apply rounded shadow-lg`
- **Interactive**: `@apply cursor-pointer hover:bg-gray-100`

## Migration Notes

- Original `main.css` now imports the new structure
- All functionality preserved with improved organization
- CSS custom properties enable theme switching
- Better PostCSS plugin compatibility
- Reduced bundle size through utility classes

## Development

When adding new styles:

1. Add component-specific styles to appropriate component files
2. Use CSS custom properties for themeable values
3. Incorporate UnoCSS @apply directives for common patterns
4. Update the main index.css import if adding new files
5. Consider adding theme variations in the themes directory

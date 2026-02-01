# VueTimelineJS3

A modern, fully refactored Vue 3 + TypeScript timeline component library. This is a complete rewrite of TimelineJS3 using modern web technologies.

## ✨ Features

- 🎯 **Vue 3 + TypeScript**: Built with Vue 3 Composition API and full TypeScript support
- 🎨 **UnoCSS + SCSS**: Modern styling with utility-first CSS and SCSS
- 🔒 **Immutable Data**: Input data is never mutated
- 🎨 **Customizable Icons**: Easy icon customization with Font Awesome by default
- 📝 **Flexible Data Mapping**: Map your custom event objects to timeline format
- 🎭 **Rich Events**: Comprehensive event system with 20+ emitted events
- 🚀 **Modern Build**: Vite-powered development and build system
- 📦 **Tree-shakeable**: ES modules with optimal bundle size

## 🚀 Quick Start

### Installation

```bash
npm install @knight-lab/timelinejs vue
```

### Basic Usage

```vue
<template>
  <VueTimelineJS3
    :data="timelineData"
    :options="options"
    @ready="onReady"
    @change="onSlideChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueTimelineJS3 } from '@knight-lab/timelinejs'
import type { TimelineData, TimelineOptions } from '@knight-lab/timelinejs'

const timelineData = ref<TimelineData>({
  title: {
    text: {
      headline: "My Timeline",
      text: "A story told through time"
    }
  },
  events: [
    {
      start_date: { year: 2020, month: 1, day: 1 },
      text: {
        headline: "Event Title",
        text: "Event description"
      },
      unique_id: "event-1"
    }
  ]
})

const options = ref<Partial<TimelineOptions>>({
  height: 600,
  timenav_position: 'bottom'
})

function onReady() {
  console.log('Timeline ready!')
}

function onSlideChange(data: { unique_id: string; slide_index: number }) {
  console.log('Changed to slide:', data.slide_index)
}
</script>
```

## 📊 Data Format

### Timeline Data Structure

```typescript
interface TimelineData {
  title?: {
    text?: {
      headline?: string
      text?: string
    }
    media?: TimelineMedia
    background?: {
      url?: string
      color?: string
    }
  }
  events: Array<{
    start_date: {
      year: string | number
      month?: string | number
      day?: string | number
      hour?: string | number
      minute?: string | number
    }
    end_date?: { /* same as start_date */ }
    text?: {
      headline?: string
      text?: string
    }
    media?: {
      url?: string
      caption?: string
      credit?: string
      thumbnail?: string
    }
    background?: {
      url?: string
      color?: string
    }
    unique_id?: string
    group?: string
  }>
  eras?: Array<{
    start_date: { /* date */ }
    end_date: { /* date */ }
    text?: { headline?: string }
  }>
}
```

## 🎨 Custom Property Mapping

Map your custom data structure to the timeline format:

```vue
<VueTimelineJS3
  :data="myCustomData"
  :property-mapping="{
    event: {
      startDate: 'date',
      headline: 'title',
      text: 'description',
      uniqueId: 'id'
    },
    date: {
      year: 'y',
      month: 'm',
      day: 'd'
    }
  }"
/>
```

Now you can use your own data structure:

```typescript
const myCustomData = {
  events: [
    {
      id: '1',
      title: 'My Event',
      description: 'Event details',
      date: { y: 2020, m: 1, d: 1 }
    }
  ]
}
```

## 🎯 Events

VueTimelineJS3 emits comprehensive events for all timeline interactions:

### Navigation Events
- `@change` - Slide changed
- `@nav_next` - Next button clicked
- `@nav_previous` - Previous button clicked
- `@back_to_start` - Go to start
- `@forward_to_end` - Go to end

### Lifecycle Events
- `@ready` - Timeline initialized
- `@dataloaded` - Data loaded
- `@loaded` - Timeline fully loaded

### Interaction Events
- `@zoom_in` - Zoomed in
- `@zoom_out` - Zoomed out
- `@markerclick` - Timeline marker clicked
- `@dragstart`, `@dragmove`, `@dragend` - Drag events

### Media Events
- `@media_loaded` - Media finished loading

And many more! See the full [Events Documentation](#events-api).

## 🎨 Custom Icons

### Using Font Awesome (Default)

Font Awesome is included by default. Use any FA icon class:

```vue
<VueTimelineJS3
  :options="{ icon_pack: 'fontawesome' }"
/>
```

### Custom Icons

Provide your own icon definitions:

```vue
<VueTimelineJS3
  :custom-icons="{
    'zoom-in': 'my-custom-zoom-in-icon',
    'zoom-out': 'my-custom-zoom-out-icon',
    'next': 'my-custom-next-icon',
    'previous': 'my-custom-previous-icon'
  }"
/>
```

## ⚙️ Configuration Options

```typescript
interface TimelineOptions {
  // Display
  width?: number | string          // Default: '100%'
  height?: number | string          // Default: 600
  
  // Navigation
  timenav_position?: 'bottom' | 'top'  // Default: 'bottom'
  timenav_height?: number              // Default: 150
  start_at_slide?: number              // Default: 0
  start_at_end?: boolean               // Default: false
  
  // Styling
  default_bg_color?: string            // Default: '#ffffff'
  icon_pack?: 'fontawesome' | 'custom' // Default: 'fontawesome'
  
  // Behavior
  dragging?: boolean                   // Default: true
  hash_bookmark?: boolean              // Default: false
  duration?: number                    // Default: 1000
  ease?: string                        // Default: 'easeInOutQuint'
}
```

## 🔧 API Methods

Access timeline methods via template refs:

```vue
<template>
  <VueTimelineJS3 ref="timeline" :data="data" />
</template>

<script setup>
import { ref } from 'vue'

const timeline = ref()

function goToSlide() {
  timeline.value.goTo(2)           // Go to slide index
  timeline.value.goToId('event-1') // Go to slide by ID
  timeline.value.goToNext()        // Go to next slide
  timeline.value.goToPrev()        // Go to previous slide
  timeline.value.goToStart()       // Go to first slide
  timeline.value.goToEnd()         // Go to last slide
  
  // Get data
  const data = timeline.value.getData(2)        // Get slide data by index
  const data2 = timeline.value.getDataById('event-1') // Get by ID
}
</script>
```

## 🏗️ Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/bkoplin/TimelineJS3.git
cd TimelineJS3

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui
```

## 🔄 Migration from TimelineJS3

### Key Differences

1. **No Google Sheets Support**: Only JSON data is supported
2. **Vue 3 Component**: Use as a Vue component, not vanilla JS
3. **Immutable Data**: Your data objects are never modified
4. **TypeScript**: Full type safety out of the box
5. **Modern Build**: Uses Vite instead of Webpack
6. **No LESS**: Styles use SCSS and UnoCSS

### Migration Example

**Old (TimelineJS3):**
```javascript
import { Timeline } from '@knight-lab/timelinejs';

const timeline = new Timeline('timeline-embed', dataUrl, options);
```

**New (VueTimelineJS3):**
```vue
<template>
  <VueTimelineJS3 :data="timelineData" :options="options" />
</template>

<script setup>
import { VueTimelineJS3 } from '@knight-lab/timelinejs'
import { ref } from 'vue'

const timelineData = ref({ events: [...] })
const options = ref({ height: 600 })
</script>
```

## 📝 License

Mozilla Public License 2.0 (MPL-2.0)

## 🙏 Credits

Originally created by Northwestern University Knight Lab. Refactored to Vue 3 + TypeScript by the community.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

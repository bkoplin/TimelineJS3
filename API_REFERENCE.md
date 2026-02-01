# VueTimelineJS3 API Reference

Complete API documentation for VueTimelineJS3 v4.0 - All components, composables, types, options, and methods.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [VueTimelineJS3 Component](#vuetimelinejs3-component)
- [Type Definitions](#type-definitions)
- [Configuration Options](#configuration-options)
- [Events](#events)
- [Methods](#methods)
- [Composables](#composables)
- [Icon Customization](#icon-customization)
- [Property Mapping](#property-mapping)
- [Examples](#examples)

---

## Installation

```bash
npm install @knight-lab/timelinejs
# or
yarn add @knight-lab/timelinejs
# or
pnpm add @knight-lab/timelinejs
```

### Import in Vue

```vue
<script setup>
import { VueTimelineJS3 } from '@knight-lab/timelinejs'
import '@knight-lab/timelinejs/dist/vue-timeline-js3.css'
</script>
```

### Import in HTML

```html
<link rel="stylesheet" href="https://unpkg.com/@knight-lab/timelinejs/dist/vue-timeline-js3.css">
<script src="https://unpkg.com/@knight-lab/timelinejs"></script>
```

---

## Quick Start

```vue
<template>
  <VueTimelineJS3 
    :data="timelineData"
    :options="options"
    @ready="onReady"
    @change="onChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import { VueTimelineJS3 } from '@knight-lab/timelinejs'

const timelineData = ref({
  events: [
    {
      start_date: { year: 2020, month: 1, day: 1 },
      text: {
        headline: "Event Title",
        text: "Event description"
      }
    }
  ]
})

const options = ref({
  height: 600,
  timenav_position: 'bottom'
})

const onReady = () => console.log('Timeline ready')
const onChange = (e) => console.log('Changed to slide:', e.slide_index)
</script>
```

---

## VueTimelineJS3 Component

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `TimelineData` | ✅ Yes | - | Timeline data containing events, title, and eras |
| `options` | `Partial<TimelineOptions>` | No | `{}` | Configuration options for the timeline |
| `propertyMapping` | `TimelinePropertyMapping` | No | `undefined` | Custom property mapping for non-standard data structures |

### Template Usage

```vue
<VueTimelineJS3
  :data="timelineData"
  :options="timelineOptions"
  :property-mapping="customMapping"
  @ready="onReady"
  @change="onChange"
/>
```

### Ref Access

```vue
<script setup>
import { ref } from 'vue'

const timeline = ref(null)

// Access methods
function navigate() {
  timeline.value?.goToNext()
  timeline.value?.zoomIn()
}
</script>

<template>
  <VueTimelineJS3 ref="timeline" :data="data" />
</template>
```

---

## Type Definitions

### TimelineData

Main data structure for timeline content.

```typescript
interface TimelineData {
  title?: TimelineTitle
  events: TimelineEvent[]
  eras?: TimelineEra[]
  scale?: string
}
```

### TimelineEvent

Individual event/slide in the timeline.

```typescript
interface TimelineEvent {
  start_date: TimelineDate          // Required
  end_date?: TimelineDate           // Optional end date
  text?: TimelineText               // Headline and text
  media?: TimelineMedia             // Images, videos, etc.
  location?: TimelineLocation       // Geographic location
  background?: {
    url?: string                    // Background image URL
    color?: string                  // Background color
  }
  unique_id?: string                // Unique identifier
  group?: string                    // Group name
  display_date?: string             // Override date display
  autolink?: boolean                // Auto-link URLs in text
  type?: string                     // Event type
}
```

### TimelineDate

Date representation supporting various precision levels.

```typescript
interface TimelineDate {
  year: string | number             // Required
  month?: string | number           // 1-12
  day?: string | number             // 1-31
  hour?: string | number            // 0-23
  minute?: string | number          // 0-59
  second?: string | number          // 0-59
  millisecond?: string | number     // 0-999
  format?: string                   // Date format string
  display_text?: string             // Override display text
}
```

### TimelineText

Text content for events.

```typescript
interface TimelineText {
  headline?: string                 // Event title
  text?: string                     // Event description (HTML allowed)
}
```

### TimelineMedia

Media attachments for events.

```typescript
interface TimelineMedia {
  url?: string                      // Media URL
  caption?: string                  // Media caption
  credit?: string                   // Media credit/source
  thumbnail?: string                // Thumbnail URL
  alt?: string                      // Alt text
  title?: string                    // Media title
  link?: string                     // Link URL
  link_target?: string              // Link target (_blank, etc.)
}
```

### TimelineTitle

Optional title slide data.

```typescript
interface TimelineTitle {
  text?: TimelineText
  media?: TimelineMedia
  background?: {
    url?: string
    color?: string
  }
  unique_id?: string
  autolink?: boolean
}
```

### TimelineEra

Era/period background on timeline.

```typescript
interface TimelineEra {
  start_date: TimelineDate          // Required
  end_date: TimelineDate            // Required
  text?: TimelineText
  unique_id?: string
}
```

---

## Configuration Options

### TimelineOptions

Complete configuration interface.

```typescript
interface TimelineOptions {
  // Display Options
  width?: number | string           // Default: '100%'
  height?: number | string          // Default: 600
  hash_bookmark?: boolean           // Default: false
  default_bg_color?: string         // Default: '#ffffff'
  scale_factor?: number             // Default: 2
  initial_zoom?: number             // Default: 0
  zoom_sequence?: number[]          // Default: [0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
  
  // Navigation Options
  timenav_position?: 'bottom' | 'top'     // Default: 'bottom'
  timenav_height?: number                 // Default: 150
  timenav_height_percentage?: number      // Default: 25
  timenav_mobile_height_percentage?: number // Default: 40
  timenav_height_min?: number             // Default: 150
  marker_height_min?: number              // Default: 30
  marker_width_min?: number               // Default: 100
  marker_padding?: number                 // Default: 5
  start_at_slide?: number                 // Default: 0
  start_at_end?: boolean                  // Default: false
  menubar_height?: number                 // Default: 0
  optimal_tick_width?: number             // Default: 100
  
  // Interaction Options
  use_bc?: boolean                  // Default: false
  duration?: number                 // Default: 1000 (ms)
  ease?: string                     // Default: 'easeInOutQuint'
  dragging?: boolean                // Default: true
  trackResize?: boolean             // Default: true
  slide_padding_lr?: number         // Default: 100
  slide_default_fade?: string       // Default: '0%'
  language?: string                 // Default: 'en'
  
  // Icon Customization (NEW in v4.0)
  icons?: {
    zoomIn?: string | object
    zoomOut?: string | object
    goToStart?: string | object
    goToEnd?: string | object
    nextSlide?: string | object
    prevSlide?: string | object
    markerDefault?: string | object
    markerActive?: string | object
    // ... see Icon Customization section
    [key: string]: any
  }
  
  // Animation Configuration (NEW in v4.0)
  animations_enabled?: boolean      // Default: true
  animation_duration?: number       // Default: 600 (ms)
  animation_easing?: string         // Default: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
  respect_reduced_motion?: boolean  // Default: true
  
  // D3 Scale Configuration (NEW in v4.0)
  timeline_padding?: number         // Default: 0.1 (10% padding)
  min_timeline_span?: number        // Default: 86400000 (1 day in ms)
  axis_tick_count?: number          // Default: 10
  scale_config?: {
    displayWidth?: number
    screenMultiplier?: number
    padding?: number
    minSpan?: number
  }
  
  // Keyboard Navigation (NEW in v4.0)
  keyboard_navigation_enabled?: boolean   // Default: true
  keyboard_navigation_keys?: {
    next?: string[]                 // Default: ['ArrowRight']
    previous?: string[]             // Default: ['ArrowLeft']
    first?: string[]                // Default: ['Home']
    last?: string[]                 // Default: ['End']
    select?: string[]               // Default: ['Enter', ' ']
    escape?: string[]               // Default: ['Escape']
    zoomIn?: string[]               // Default: ['Control+=', 'Meta+=']
    zoomOut?: string[]              // Default: ['Control+-', 'Meta+-']
  }
  
  // Touch Navigation (NEW in v4.0)
  touch_navigation_enabled?: boolean      // Default: true
  swipe_min_distance?: number             // Default: 50 (pixels)
  swipe_velocity_threshold?: number       // Default: 0.3 (px/ms)
  swipe_prevent_default?: boolean         // Default: true
}
```

### Default Options

```typescript
const defaultOptions: TimelineOptions = {
  width: '100%',
  height: 600,
  timenav_position: 'bottom',
  timenav_height: 150,
  start_at_slide: 0,
  menubar_height: 0,
  duration: 1000,
  ease: 'easeInOutQuint',
  dragging: true,
  animations_enabled: true,
  animation_duration: 600,
  keyboard_navigation_enabled: true,
  touch_navigation_enabled: true,
  timeline_padding: 0.1,
  axis_tick_count: 10
}
```

---

## Events

All events are emitted via Vue's standard emit system.

### Event Reference

| Event Name | Payload | Description |
|------------|---------|-------------|
| `ready` | `undefined` | Timeline is initialized and ready |
| `dataloaded` | `undefined` | Data has been loaded |
| `loaded` | `{ scale, eras, events, title }` | Timeline fully loaded with all data |
| `change` | `{ unique_id, slide_index }` | Current slide changed |
| `nav_next` | `undefined` | Navigated to next slide |
| `nav_previous` | `undefined` | Navigated to previous slide |
| `back_to_start` | `undefined` | Navigated to first slide |
| `forward_to_end` | `undefined` | Navigated to last slide |
| `zoom_in` | `{ zoom_level }` | Zoomed in |
| `zoom_out` | `{ zoom_level }` | Zoomed out |
| `markerclick` | `{ unique_id }` | Marker clicked |
| `markerblur` | `{ unique_id }` | Marker blurred/unfocused |
| `media_loaded` | `{ unique_id }` | Media loaded for slide |
| `added` | `{ unique_id }` | Event added to timeline |
| `removed` | `{ unique_id }` | Event removed from timeline |
| `hash_updated` | `{ unique_id, hashbookmark }` | URL hash updated |
| `color_change` | `{ unique_id }` | Slide color changed |
| `background_change` | `{ unique_id }` | Slide background changed |
| `keyboard_navigation` | `{ key, action }` | Keyboard navigation used |
| `swipe_left` | `undefined` | Swiped left |
| `swipe_right` | `undefined` | Swiped right |
| `swipe_up` | `undefined` | Swiped up |
| `swipe_down` | `undefined` | Swiped down |

### Event Usage

```vue
<template>
  <VueTimelineJS3
    @ready="onReady"
    @change="onChange"
    @zoom_in="onZoomIn"
    @keyboard_navigation="onKeyboard"
    @swipe_left="onSwipe"
  />
</template>

<script setup>
const onReady = () => {
  console.log('Timeline ready')
}

const onChange = (data) => {
  console.log('Changed to:', data.slide_index)
  console.log('Event ID:', data.unique_id)
}

const onZoomIn = (data) => {
  console.log('Zoomed to level:', data.zoom_level)
}

const onKeyboard = (data) => {
  console.log('Key pressed:', data.key)
  console.log('Action:', data.action)
}

const onSwipe = () => {
  console.log('User swiped left')
}
</script>
```

---

## Methods

Access methods via component ref.

### Navigation Methods

#### `goTo(slideIndex: number): void`
Navigate to a specific slide by index.

```typescript
timeline.value?.goTo(3)  // Go to slide at index 3
```

#### `goToId(uniqueId: string): void`
Navigate to a slide by its unique_id.

```typescript
timeline.value?.goToId('event-2020-01-01')
```

#### `goToNext(): void`
Navigate to the next slide.

```typescript
timeline.value?.goToNext()
```

#### `goToPrev(): void`
Navigate to the previous slide.

```typescript
timeline.value?.goToPrev()
```

#### `goToStart(): void`
Navigate to the first slide.

```typescript
timeline.value?.goToStart()
```

#### `goToEnd(): void`
Navigate to the last slide.

```typescript
timeline.value?.goToEnd()
```

### Zoom Methods

#### `zoomIn(): void`
Zoom in on the timeline.

```typescript
timeline.value?.zoomIn()  // Smooth zoom in animation
```

#### `zoomOut(): void`
Zoom out on the timeline.

```typescript
timeline.value?.zoomOut()  // Smooth zoom out animation
```

#### `setZoom(level: number): void`
Set specific zoom level.

```typescript
timeline.value?.setZoom(2.5)
```

### Data Methods

#### `getData(): TimelineData`
Get the current timeline data.

```typescript
const data = timeline.value?.getData()
console.log(data.events.length)
```

#### `getSlide(index: number): TimelineEvent | TimelineTitle | undefined`
Get slide data by index.

```typescript
const slide = timeline.value?.getSlide(2)
console.log(slide?.text?.headline)
```

#### `getCurrentSlide(): TimelineEvent | TimelineTitle | undefined`
Get current slide data.

```typescript
const current = timeline.value?.getCurrentSlide()
```

#### `addEvent(event: TimelineEvent): void`
Add a new event to the timeline.

```typescript
timeline.value?.addEvent({
  start_date: { year: 2024 },
  text: { headline: 'New Event' },
  unique_id: 'new-event'
})
```

#### `removeEvent(uniqueId: string): void`
Remove an event from the timeline.

```typescript
timeline.value?.removeEvent('event-to-remove')
```

### Navigation Control Methods (NEW in v4.0)

#### `enableKeyboardNavigation(): void`
Enable keyboard navigation.

```typescript
timeline.value?.enableKeyboardNavigation()
```

#### `disableKeyboardNavigation(): void`
Disable keyboard navigation.

```typescript
timeline.value?.disableKeyboardNavigation()
```

#### `enableTouchNavigation(): void`
Enable touch/swipe navigation.

```typescript
timeline.value?.enableTouchNavigation()
```

#### `disableTouchNavigation(): void`
Disable touch/swipe navigation.

```typescript
timeline.value?.disableTouchNavigation()
```

#### `setAnimations(enabled: boolean): void`
Enable or disable animations.

```typescript
timeline.value?.setAnimations(false)  // Disable animations
```

---

## Composables

Internal composables (for advanced usage/customization).

### useTimelineState

Manages timeline state with immutability.

```typescript
import { useTimelineState } from '@knight-lab/timelinejs'

const state = useTimelineState(data, options)
const {
  data,              // readonly ref to timeline data
  events,            // readonly ref to events
  currentSlideIndex, // readonly ref to current index
  isReady,           // readonly ref to ready state
  isLoading,         // readonly ref to loading state
  setCurrentSlide,   // function to update current slide
  addEvent,          // function to add event
  removeEvent        // function to remove event
} = state
```

### useTimelinePositioning

D3 Scale-based positioning system.

```typescript
import { useTimelinePositioning } from '@knight-lab/timelinejs'

const positioning = useTimelinePositioning(events, options, config)
const {
  scale,             // D3 scale ref
  markerPositions,   // computed marker positions
  zoomIn,            // zoom in function
  zoomOut,           // zoom out function
  zoomLevel          // current zoom level
} = positioning
```

### useTimelineAnimation

Animation system with requestAnimationFrame.

```typescript
import { useTimelineAnimation } from '@knight-lab/timelinejs'

const animation = useTimelineAnimation(config)
const {
  animateValue,      // function(start, end, update, duration)
  getCSSTransition,  // function(property, duration, easing)
  isEnabled          // computed boolean
} = animation
```

### useKeyboardNavigation

Keyboard event handling.

```typescript
import { useKeyboardNavigation } from '@knight-lab/timelinejs'

const keyboard = useKeyboardNavigation(handlers)
const {
  attach,            // function to attach listeners
  detach,            // function to detach listeners
  isEnabled          // computed boolean
} = keyboard
```

### useTouchNavigation

Touch/swipe gesture detection.

```typescript
import { useTouchNavigation } from '@knight-lab/timelinejs'

const touch = useTouchNavigation(element, handlers, config)
const {
  attach,            // function to attach listeners
  detach,            // function to detach listeners
  isEnabled          // computed boolean
} = touch
```

### useIconProvider

Icon customization system.

```typescript
import { useIconProvider } from '@knight-lab/timelinejs'

const icons = useIconProvider(customIcons)
const {
  getIcon,           // function(name) returns icon
  renderIcon,        // function(icon, attrs) returns VNode
  iconRenderers,     // computed renderers for common icons
  updateIcons        // function to update icons at runtime
} = icons
```

---

## Icon Customization

Complete icon customization system supporting multiple formats.

### Supported Icon Formats

1. **Font Awesome classes** (default)
2. **Emoji strings**
3. **SVG strings**
4. **Image URLs**
5. **Vue components**
6. **VNodes**

### Available Icon Names

```typescript
{
  // Menu bar (4 icons)
  zoomIn, zoomOut, goToStart, goToEnd,
  
  // Navigation (2 icons)
  nextSlide, prevSlide,
  
  // Markers (3 icons)
  markerDefault, markerActive, markerHover,
  
  // Media types (7 icons)
  mediaImage, mediaVideo, mediaAudio, mediaWebsite,
  mediaDocument, mediaMap, mediaEmbed,
  
  // State (5 icons)
  loading, error, warning, info, success,
  
  // UI (7 icons)
  close, expand, collapse, share, download,
  fullscreen, exitFullscreen,
  
  // Custom icons (unlimited)
  [customName]: icon
}
```

### Icon Usage Examples

#### Font Awesome (Default)
```vue
<VueTimelineJS3 :data="timeline" />
<!-- Uses Font Awesome icons by default -->
```

#### Custom Font Awesome
```vue
<VueTimelineJS3 
  :options="{
    icons: {
      zoomIn: 'fa-solid fa-magnifying-glass-plus',
      zoomOut: 'fa-solid fa-magnifying-glass-minus'
    }
  }"
/>
```

#### Emoji Icons
```vue
<VueTimelineJS3 
  :options="{
    icons: {
      zoomIn: '🔍+',
      zoomOut: '🔍−',
      nextSlide: '▶️',
      prevSlide: '◀️',
      loading: '⏳',
      error: '❌'
    }
  }"
/>
```

#### SVG Icons
```vue
<VueTimelineJS3 
  :options="{
    icons: {
      zoomIn: {
        svg: '<svg width=\"16\" height=\"16\"><circle cx=\"8\" cy=\"8\" r=\"6\" /></svg>'
      }
    }
  }"
/>
```

#### Image Icons
```vue
<VueTimelineJS3 
  :options="{
    icons: {
      loading: { url: '/spinner.gif' },
      error: { url: '/error-icon.png' }
    }
  }"
/>
```

#### Vue Component Icons
```vue
<script setup>
import ZoomInIcon from './icons/ZoomInIcon.vue'

const options = {
  icons: {
    zoomIn: ZoomInIcon
  }
}
</script>
```

#### Bootstrap Icons
```vue
<VueTimelineJS3 
  :options="{
    icons: {
      zoomIn: 'bi bi-zoom-in',
      zoomOut: 'bi bi-zoom-out',
      nextSlide: 'bi bi-chevron-right',
      prevSlide: 'bi bi-chevron-left'
    }
  }"
/>
```

---

## Property Mapping

Map custom data structures to timeline format.

### TimelinePropertyMapping

```typescript
interface TimelinePropertyMapping {
  events?: string              // Path to events array
  event?: {
    startDate?: string         // Path to start date
    endDate?: string           // Path to end date
    headline?: string          // Path to headline
    text?: string              // Path to text
    media?: string             // Path to media
    uniqueId?: string          // Path to unique ID
    group?: string             // Path to group
  }
  date?: {
    year?: string
    month?: string
    day?: string
    hour?: string
    minute?: string
    second?: string
  }
}
```

### Property Mapping Example

```vue
<script setup>
// Your existing data structure
const myData = {
  timeline_items: [
    {
      when: '2020-01-01',
      title: 'Event Title',
      description: 'Event text',
      image_url: 'https://...'
    }
  ]
}

// Map to timeline format
const mapping = {
  events: 'timeline_items',
  event: {
    startDate: 'when',
    headline: 'title',
    text: 'description',
    media: 'image_url'
  }
}
</script>

<template>
  <VueTimelineJS3 
    :data="myData"
    :property-mapping="mapping"
  />
</template>
```

---

## Examples

### Complete Example

```vue
<template>
  <div class="app">
    <div class="controls">
      <button @click="timeline?.goToPrev()">Previous</button>
      <button @click="timeline?.goToNext()">Next</button>
      <button @click="timeline?.zoomIn()">Zoom In</button>
      <button @click="timeline?.zoomOut()">Zoom Out</button>
    </div>
    
    <VueTimelineJS3
      ref="timeline"
      :data="timelineData"
      :options="options"
      @ready="onReady"
      @change="onChange"
      @zoom_in="onZoom"
      @keyboard_navigation="onKeyboard"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { VueTimelineJS3 } from '@knight-lab/timelinejs'
import type { TimelineData, TimelineOptions } from '@knight-lab/timelinejs'

const timeline = ref(null)

const timelineData = ref<TimelineData>({
  title: {
    text: {
      headline: "My Timeline",
      text: "An example timeline"
    }
  },
  events: [
    {
      start_date: { year: 2020, month: 1, day: 1 },
      text: {
        headline: "First Event",
        text: "This is the first event"
      },
      media: {
        url: "https://example.com/image.jpg",
        caption: "Example image"
      },
      unique_id: "event-1"
    },
    {
      start_date: { year: 2021, month: 6, day: 15 },
      end_date: { year: 2021, month: 6, day: 20 },
      text: {
        headline: "Second Event",
        text: "This event has a duration"
      },
      unique_id: "event-2"
    }
  ],
  eras: [
    {
      start_date: { year: 2020, month: 1, day: 1 },
      end_date: { year: 2020, month: 12, day: 31 },
      text: {
        headline: "2020 Era"
      }
    }
  ]
})

const options = ref<Partial<TimelineOptions>>({
  height: 600,
  timenav_position: 'bottom',
  menubar_height: 40,
  
  // D3 Scale
  timeline_padding: 0.1,
  axis_tick_count: 10,
  
  // Animations
  animations_enabled: true,
  animation_duration: 600,
  respect_reduced_motion: true,
  
  // Navigation
  keyboard_navigation_enabled: true,
  touch_navigation_enabled: true,
  
  // Custom icons (emoji)
  icons: {
    zoomIn: '🔍+',
    zoomOut: '🔍−',
    nextSlide: '▶️',
    prevSlide: '◀️'
  }
})

const onReady = () => {
  console.log('Timeline is ready!')
}

const onChange = (data) => {
  console.log('Changed to slide:', data.slide_index)
}

const onZoom = (data) => {
  console.log('Zoom level:', data.zoom_level)
}

const onKeyboard = (data) => {
  console.log('Keyboard:', data.key, data.action)
}
</script>

<style scoped>
.app {
  padding: 20px;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}
</style>
```

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Mozilla Public License 2.0 (MPL-2.0)

## Links

- [GitHub Repository](https://github.com/bkoplin/TimelineJS3)
- [Migration Guide](./MIGRATION.md)
- [Migration Mapping](./MIGRATION_MAPPING.md)
- [Animation Guide](./ANIMATION_GUIDE.md)
- [Navigation Guide](./NAVIGATION_GUIDE.md)
- [Scale Guide](./SCALE_GUIDE.md)

# GSAP Vue Components

This directory contains Vue 3 wrapper components for GSAP plugins with full TypeScript support and Vue-friendly APIs.

## Components

### GsapDraggable
A Vue 3 wrapper component for GSAP's Draggable plugin that provides full TypeScript support and Vue-friendly event handling.

### GsapScrollTrigger  
A Vue 3 wrapper component for GSAP's ScrollTrigger plugin that enables scroll-based animations with reactive properties and event handling.

---

# GsapDraggable Component

A Vue 3 wrapper component for GSAP's Draggable plugin that provides full TypeScript support and Vue-friendly event handling.

## Features

- **Full TypeScript Support**: Complete type definitions based on GSAP Draggable interface
- **Vue Events**: All GSAP callbacks are converted to Vue events 
- **Reactive Properties**: All Draggable instance properties are exposed as computed values
- **Method Proxying**: All Draggable methods are available on the component instance
- **Slot Support**: Wrap any content to make it draggable
- **Props Validation**: Props match the exact GSAP Draggable.Vars interface

## Basic Usage

```vue
<template>
  <GsapDraggable
    type="x,y"
    bounds="parent"
    @dragstart="handleDragStart"
    @drag="handleDrag"
    @dragend="handleDragEnd"
  >
    <div class="draggable-content">
      Drag me around!
    </div>
  </GsapDraggable>
</template>

<script setup lang="ts">
import GsapDraggable from '@/components/GSAP/GsapDraggable.vue'

function handleDragStart(event: Event, draggable: Draggable) {
  console.log('Drag started')
}

function handleDrag(event: Event, draggable: Draggable) {
  console.log('Current position:', { x: draggable.x, y: draggable.y })
}

function handleDragEnd(event: Event, draggable: Draggable) {
  console.log('Drag ended')
}
</script>
```

## Props

The component accepts all props from the GSAP `Draggable.Vars` interface, plus:

- `disabled` (boolean): Vue-specific prop to enable/disable dragging

### Common Props

- `type`: `'x' | 'y' | 'x,y' | 'rotation' | 'scroll'` - Type of dragging
- `bounds`: Boundaries for dragging (element, object, or string)
- `inertia`: Enable momentum/inertia physics
- `snap`: Snap to specific values or points
- `lockAxis`: Lock to single axis during drag
- `edgeResistance`: Resistance when hitting bounds
- `throwProps`: Enable throwing with momentum

## Events

All GSAP callbacks are available as Vue events:

- `@click` - Element was clicked
- `@press` - Mouse/touch pressed down
- `@drag` - Currently dragging
- `@dragstart` - Drag operation started
- `@dragend` - Drag operation ended
- `@release` - Mouse/touch released
- `@move` - Element moved (programmatically)
- `@throwupdate` - During momentum throwing
- `@throwcomplete` - Momentum throwing completed

Each event receives: `(event: Event, draggable: Draggable)`

## Exposed Properties

All Draggable instance properties are exposed as reactive refs that update automatically during dragging:

```vue
<script setup lang="ts">
const draggableRef = ref<InstanceType<typeof GsapDraggable>>()

// Access current position reactively
watch(() => draggableRef.value?.x, (newX) => {
  console.log('X position changed:', newX)
})

// These values update in real-time during dragging
const isDragging = computed(() => draggableRef.value?.isDragging)
const currentPosition = computed(() => ({
  x: draggableRef.value?.x ?? 0,
  y: draggableRef.value?.y ?? 0
}))
</script>

<template>
  <div>
    <GsapDraggable ref="draggableRef" type="x,y">
      <div>Drag me!</div>
    </GsapDraggable>
    
    <!-- These display live updates during dragging -->
    <p>Position: {{ currentPosition.x }}, {{ currentPosition.y }}</p>
    <p>Dragging: {{ isDragging ? 'Yes' : 'No' }}</p>
  </div>
</template>
```

### Available Properties

- `x`, `y` - Current position
- `startX`, `startY` - Starting position
- `endX`, `endY` - End position
- `deltaX`, `deltaY` - Change in position
- `isDragging` - Currently dragging
- `isPressed` - Mouse/touch is pressed
- `isThrowing` - Currently in momentum mode
- `rotation` - Current rotation
- `pointerX`, `pointerY` - Pointer position
- And many more...

## Exposed Methods

All Draggable methods are available on the component instance:

```vue
<script setup lang="ts">
const draggableRef = ref<InstanceType<typeof GsapDraggable>>()

function disableDragging() {
  draggableRef.value?.disable()
}

function enableDragging() {
  draggableRef.value?.enable()
}

function updatePosition() {
  draggableRef.value?.update(true, true)
}

function setBounds() {
  draggableRef.value?.applyBounds('#container')
}
</script>
```

### Available Methods

- `enable()` / `disable()` - Enable/disable dragging
- `kill()` - Destroy the draggable instance
- `update()` - Update position and bounds
- `applyBounds()` - Apply new boundaries
- `addEventListener()` / `removeEventListener()` - Event management
- `hitTest()` - Test collision with other elements
- `getDirection()` - Get drag direction
- And more...

## Examples

### X-Only Dragging

```vue
<GsapDraggable type="x" bounds="parent">
  <div class="slider">Horizontal only</div>
</GsapDraggable>
```

### Rotation

```vue
<GsapDraggable type="rotation">
  <div class="wheel">🎡</div>
</GsapDraggable>
```

### With Snap

```vue
<GsapDraggable
  type="x,y"
  :snap="{ x: [0, 100, 200], y: [0, 100, 200] }"
>
  <div class="grid-item">Snaps to grid</div>
</GsapDraggable>
```

### With Inertia

```vue
<GsapDraggable
  type="x,y"
  :inertia="true"
  bounds="parent"
>
  <div class="physics-object">Has momentum</div>
</GsapDraggable>
```

### Programmatic Control

```vue
<template>
  <div>
    <GsapDraggable
      ref="draggableRef"
      type="x,y"
      :disabled="isDisabled"
    >
      <div class="box">Controlled box</div>
    </GsapDraggable>
    
    <button @click="toggleDisabled">
      {{ isDisabled ? 'Enable' : 'Disable' }}
    </button>
  </div>
</template>

<script setup lang="ts">
const draggableRef = ref<InstanceType<typeof GsapDraggable>>()
const isDisabled = ref(false)

function toggleDisabled() {
  isDisabled.value = !isDisabled.value
}

// Get current position
const currentX = computed(() => draggableRef.value?.x ?? 0)
const currentY = computed(() => draggableRef.value?.y ?? 0)
</script>
```

## TypeScript Support

The component provides full TypeScript support with proper type inference:

```typescript
import type { Draggable } from '@/composables/useGsap'

// Event handlers are properly typed
function handleDrag(event: Event, draggable: Draggable) {
  // draggable is fully typed with all properties and methods
  const position = { x: draggable.x, y: draggable.y }
}

// Component ref is properly typed
const draggableRef = ref<InstanceType<typeof GsapDraggable>>()
```

## Requirements

- Vue 3
- GSAP with Draggable plugin registered
- TypeScript (optional but recommended)

## Installation

The component is already set up in this project. GSAP and Draggable are imported from the `useGsap` composable which handles plugin registration.

---

# GsapScrollTrigger Component

A Vue 3 wrapper component for GSAP's ScrollTrigger plugin that enables scroll-based animations with reactive properties and event handling.

## Features

- **Reactive Properties**: All ScrollTrigger properties are exposed as reactive Vue refs
- **Event Handling**: Comprehensive event system with Vue-style event emitters
- **Type Safety**: Full TypeScript support with proper type definitions
- **Auto-refresh**: Optional automatic refresh on element resize
- **Easy Integration**: Simple prop-based configuration

## Basic Usage

```vue
<script setup>
import GsapScrollTrigger from '@/components/GSAP/GsapScrollTrigger.vue'

function handleEnter() {
  // Animation enters viewport
}
</script>

<template>
  <GsapScrollTrigger
    start="top center"
    end="bottom center"
    :scrub="true"
    :markers="true"
    @enter="handleEnter"
  >
    <div class="animated-content">
      <!-- Your content here -->
    </div>
  </GsapScrollTrigger>
</template>
```

## Props

### Core ScrollTrigger Properties

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `gsap.DOMTarget` | container element | Element that triggers the ScrollTrigger |
| `start` | `string \| number` | `"top bottom"` | Start position for the trigger |
| `end` | `string \| number` | `"bottom top"` | End position for the trigger |
| `scrub` | `boolean \| number` | `false` | Links animation progress to scroll position |
| `pin` | `boolean \| gsap.DOMTarget` | `false` | Pins element during scroll |
| `horizontal` | `boolean` | `false` | Enable horizontal scrolling |
| `markers` | `boolean \| object` | `false` | Show debug markers |

### Vue-Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | `false` | Disable the ScrollTrigger |
| `autoRefresh` | `boolean` | `true` | Auto-refresh on resize |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `@enter` | `ScrollTrigger` | Fired when entering the trigger area |
| `@leave` | `ScrollTrigger` | Fired when leaving the trigger area |
| `@update` | `ScrollTrigger` | Fired on every scroll update |
| `@refresh` | `ScrollTrigger` | Fired when ScrollTrigger refreshes |

## Exposed Properties

Access these through a template ref:

```vue
<script setup>
const scrollTriggerRef = ref()

// Access properties
const progress = computed(() => scrollTriggerRef.value?.progress || 0)
</script>

<template>
  <GsapScrollTrigger ref="scrollTriggerRef">
    <!-- content -->
  </GsapScrollTrigger>
</template>
```

### Available Properties

- `progress` - Current progress (0-1)
- `direction` - Scroll direction (1 or -1)
- `isActive` - Whether ScrollTrigger is active
- `start`, `end` - Calculated start/end positions

### Available Methods

- `refresh()` - Refresh the ScrollTrigger
- `update()` - Update the ScrollTrigger
- `enable()`, `disable()` - Enable/disable the trigger
- `kill()` - Destroy the ScrollTrigger

## Examples

### Basic Scroll Animation

```vue
<GsapScrollTrigger
  start="top 80%"
  end="bottom 20%"
  :scrub="1"
>
  <div class="fade-in-content">
    Content that animates on scroll
  </div>
</GsapScrollTrigger>
```

### Pinned Section

```vue
<GsapScrollTrigger
  :pin="true"
  start="top top"
  end="+=300"
  :scrub="true"
>
  <div class="pinned-section">
    This section stays pinned while scrolling
  </div>
</GsapScrollTrigger>
```

### Horizontal Scrolling

```vue
<GsapScrollTrigger
  :horizontal="true"
  start="left right"
  end="right left"
  :scrub="1"
>
  <div class="horizontal-content">
    Horizontal scroll content
  </div>
</GsapScrollTrigger>
```

### With Animation Timeline

```vue
<script setup>
import { gsap } from '@/composables/useGsap'

const targetRef = ref()
const timeline = ref()

onMounted(() => {
  timeline.value = gsap.timeline({ paused: true })
    .to(targetRef.value, { x: 100, duration: 1 })
    .to(targetRef.value, { rotation: 360, duration: 1 })
})
</script>

<template>
  <GsapScrollTrigger
    :animation="timeline"
    :scrub="true"
  >
    <div ref="targetRef">
      Animated element
    </div>
  </GsapScrollTrigger>
</template>
```

### Snap to Sections

```vue
<GsapScrollTrigger
  :snap="{ snapTo: 'labels', duration: { min: 0.2, max: 3 }, delay: 0.2 }"
  start="top top"
  end="bottom bottom"
>
  <div>
    <section data-label="section1">Section 1</section>
    <section data-label="section2">Section 2</section>
    <section data-label="section3">Section 3</section>
  </div>
</GsapScrollTrigger>
```

## Advanced Usage

### Custom Event Handling

```vue
<script setup>
function handleScrollUpdate(scrollTrigger) {
  const progress = scrollTrigger.progress
  // Custom logic based on scroll progress
}

function handleEnter(scrollTrigger) {
  // Custom enter animation
  gsap.to('.my-element', { opacity: 1, duration: 0.5 })
}
</script>

<template>
  <GsapScrollTrigger
    @update="handleScrollUpdate"
    @enter="handleEnter"
    :scrub="false"
  >
    <div class="my-element">Content</div>
  </GsapScrollTrigger>
</template>
```

### Dynamic Configuration

```vue
<script setup>
const isHorizontal = ref(false)
const scrubValue = ref(1)

// Toggle between horizontal and vertical
function toggleOrientation() {
  isHorizontal.value = !isHorizontal.value
}
</script>

<template>
  <GsapScrollTrigger
    :horizontal="isHorizontal"
    :scrub="scrubValue"
    :start="isHorizontal ? 'left right' : 'top bottom'"
    :end="isHorizontal ? 'right left' : 'bottom top'"
  >
    <div>Dynamic content</div>
  </GsapScrollTrigger>
</template>
```

## Notes

- The component automatically uses the container element as the trigger if no `trigger` prop is provided
- ScrollTrigger instances are automatically cleaned up when the component is unmounted
- The component is reactive to prop changes and will recreate the ScrollTrigger when necessary
- Auto-refresh helps maintain proper positioning when content or viewport changes

## Requirements

- Vue 3
- GSAP with ScrollTrigger plugin registered
- TypeScript (optional but recommended)

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

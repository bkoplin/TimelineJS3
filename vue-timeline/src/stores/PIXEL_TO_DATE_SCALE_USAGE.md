# Pixel to Date Scale Usage Examples

The `pixelToDateScale` computed property provides reactive functions to convert between pixel positions and dates based on your timeline's event range.

## Basic Usage

```typescript
import { useTimelineStore } from '@/stores/timelineStore'

const timelineStore = useTimelineStore()

// Get an element's bounding box
const element = document.getElementById('timeline-element')
const rect = element.getBoundingClientRect()

// Method 1: Using the general functions
const { pixelToDateScale } = timelineStore

// Convert a pixel position to a date
const clickX = 150 // pixels from left edge of screen
const dateAtClick = pixelToDateScale.toDate(clickX, rect.left, rect.right)

// Convert a date to a pixel position
const someDate = new Date('2023-06-15')
const pixelPosition = pixelToDateScale.toPixel(someDate, rect.left, rect.right)

// Method 2: Create a scale for a specific element (recommended)
const elementScale = pixelToDateScale.forElement({
  left: rect.left,
  right: rect.right
})

// Now use the element-specific scale
const dateAtClick2 = elementScale.toDate(clickX)
const pixelPosition2 = elementScale.toPixel(someDate)
```

## Example: Timeline Scrubber Component

```vue
<template>
  <div 
    ref="scrubberRef"
    class="timeline-scrubber"
    @mousemove="handleMouseMove"
    @click="handleClick"
  >
    <!-- Timeline background -->
    <div class="timeline-track"></div>
    
    <!-- Current position indicator -->
    <div 
      class="position-indicator"
      :style="{ left: currentPositionPixels + 'px' }"
    ></div>
    
    <!-- Show hover date -->
    <div v-if="hoverDate" class="hover-date">
      {{ hoverDate.format('MMMM D, YYYY') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useTimelineStore } from '@/stores/timelineStore'
import { moment } from '#/useMoment'

const timelineStore = useTimelineStore()
const scrubberRef = ref<HTMLElement>()
const hoverDate = ref<moment.Moment | null>(null)

// Create reactive scale for this element
const elementScale = computed(() => {
  if (!scrubberRef.value) return null
  
  const rect = scrubberRef.value.getBoundingClientRect()
  return timelineStore.pixelToDateScale.forElement({
    left: rect.left,
    right: rect.right
  })
})

// Current position in pixels based on current slide
const currentPositionPixels = computed(() => {
  if (!elementScale.value || !timelineStore.current) return 0
  
  const currentDate = timelineStore.current.start_date?.toDate()
  if (!currentDate) return 0
  
  const rect = scrubberRef.value?.getBoundingClientRect()
  if (!rect) return 0
  
  return elementScale.value.toPixel(currentDate) - rect.left
})

function handleMouseMove(event: MouseEvent) {
  if (!elementScale.value) return
  
  const rect = scrubberRef.value!.getBoundingClientRect()
  const relativeX = event.clientX - rect.left
  const date = elementScale.value.toDate(event.clientX)
  
  hoverDate.value = moment(date)
}

function handleClick(event: MouseEvent) {
  if (!elementScale.value) return
  
  const date = elementScale.value.toDate(event.clientX)
  const targetMoment = moment(date)
  
  // Find the closest event to this date
  const closestEvent = timelineStore.parsedEvents.reduce((closest, event) => {
    if (!event.start_date) return closest
    
    const eventDistance = Math.abs(event.start_date.diff(targetMoment))
    const closestDistance = closest?.start_date ? 
      Math.abs(closest.start_date.diff(targetMoment)) : Infinity
    
    return eventDistance < closestDistance ? event : closest
  }, null as any)
  
  if (closestEvent) {
    timelineStore.goTo(closestEvent.unique_id)
  }
}
</script>

<style scoped>
.timeline-scrubber {
  position: relative;
  width: 100%;
  height: 40px;
  background: #f0f0f0;
  cursor: pointer;
}

.timeline-track {
  width: 100%;
  height: 4px;
  background: #ddd;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.position-indicator {
  width: 2px;
  height: 100%;
  background: #007bff;
  position: absolute;
  top: 0;
  pointer-events: none;
}

.hover-date {
  position: absolute;
  top: -30px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
}
</style>
```

## Example: Draggable Timeline Marker

```vue
<template>
  <div 
    ref="containerRef"
    class="timeline-container"
  >
    <GsapDraggable
      type="x"
      :bounds="{ left: 0, right: containerWidth }"
      @drag="handleDrag"
    >
      <div class="timeline-marker">
        <div class="marker-date">
          {{ markerDate.format('MMM D, YYYY') }}
        </div>
      </div>
    </GsapDraggable>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useTimelineStore } from '@/stores/timelineStore'
import { moment } from '#/useMoment'
import GsapDraggable from '@/components/GSAP/GsapDraggable.vue'

const timelineStore = useTimelineStore()
const containerRef = ref<HTMLElement>()
const containerWidth = ref(800)
const markerDate = ref(moment())

// Create scale for the container
const containerScale = computed(() => {
  if (!containerRef.value) return null
  
  return timelineStore.pixelToDateScale.forElement({
    left: 0,
    right: containerWidth.value
  })
})

function handleDrag(event: Event, draggable: any) {
  if (!containerScale.value) return
  
  // Convert the draggable's x position to a date
  const date = containerScale.value.toDate(draggable.x)
  markerDate.value = moment(date)
  
  // Optionally navigate to the closest event
  // timelineStore.goToClosestEvent(date)
}

onMounted(() => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.offsetWidth
  }
})
</script>
```

## Available Methods

### `pixelToDateScale.toDate(pixelPosition, elementLeft, elementRight)`
Converts a pixel position to a date within the timeline range.

### `pixelToDateScale.toPixel(date, elementLeft, elementRight)`
Converts a date to a pixel position within the element bounds.

### `pixelToDateScale.forElement(bounds)`
Creates a scale function specifically for an element with given bounds.

### `pixelToDateScale.dateRange`
Returns the min/max dates being used for the scale.

The scale automatically updates when your timeline data changes, making it fully reactive!

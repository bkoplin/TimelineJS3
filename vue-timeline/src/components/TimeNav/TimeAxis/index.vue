<script lang="ts" setup>
import type { Language, Tick, TimeAxisOptions } from '../../../types'
import '../../../style/base/variables.css'

interface Props {
  options: TimeAxisOptions
  language: Language
  timescale?: any
} 

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'visibleTicksChange', payload: { visible_ticks: any }): void
}>()

// Template ref for the axis container
const timeAxisEl = ref<HTMLDivElement | null>(null)

// Create reactive options ref
const optionsRef = ref(props.options)
const tickEls = useTemplateRefsList<GlobalComponents['TimeNavTimeAxisMarker']>()
const containerRect = toReactive(useElementBounding(timeAxisEl))
const ticks = ref<Tick[]>([])
const visibleTicks = ref<Tick[]>([])

// Watch for element resize and update ticks
useResizeObserver(timeAxisEl, () => {
  updateVisibleTicks()
})

// Generate and update ticks on the timeline
function drawTicks(timescale: any, optimal_tick_width: number): void {
  // Clear existing ticks
  ticks.value = []

  const pixelWidth = timescale.getPixelWidth()
  const numberOfTicks = Math.floor(pixelWidth / optimal_tick_width)

  // Generate ticks based on timeline scale
  generateTicks(timescale, numberOfTicks)

  // Update visible ticks
  nextTick(() => {
    updateVisibleTicks()
  })
}

// Position existing ticks (for performance when scale doesn't change)
function positionTicks(timescale: any, _optimal_tick_width: number): void {
  // Update tick positions without regenerating
  updateTickPositions(timescale)
  updateVisibleTicks()
}

// Generate tick data
function generateTicks(timescale: any, numberOfTicks: number): void {
  const majorScale = timescale.getMajorScale()
  const minorScale = timescale.getMinorScale()
  const pixelWidth = timescale.getPixelWidth()

  // Create mock date range for ticks
  const startDate = new Date(2020, 0, 1)
  const endDate = new Date(2024, 11, 31)
  const dateRange = endDate.getTime() - startDate.getTime()

  for (let i = 0; i <= numberOfTicks; i++) {
    const ratio = i / numberOfTicks
    const position = ratio * pixelWidth
    const tickDate = new Date(startDate.getTime() + (ratio * dateRange))

    // Determine if this is a major or minor tick
    const isMajorTick = i % 5 === 0 // Every 5th tick is major

    ticks.value.push({
      position,
      label: formatTickLabel(tickDate, isMajorTick ? majorScale : minorScale),
      type: isMajorTick ? 'major' : 'minor',
      date: tickDate,
    })
  }
}

// Update tick positions when timescale changes
function updateTickPositions(timescale: any): void {
  ticks.value.forEach((tick, index) => {
    const position = timescale.getPosition(tick.date.getTime())
    ticks.value[index].position = position
  })
}

// Update visible ticks based on current viewport
function updateVisibleTicks(): void {
  const containerLeft = containerRect.left
  const containerRight = containerRect.right

  visibleTicks.value = ticks.value.filter((tick) => {
    const tickLeft = containerLeft + tick.position
    return tickLeft >= containerLeft && tickLeft <= containerRight
  })
}

// Format tick label based on scale
function formatTickLabel(date: Date, scale: string): string {
  switch (scale) {
    case 'year':
      return date.getFullYear().toString()
    case 'month':
      return date.toLocaleDateString(props.language?.code || 'en', { month: 'short' })
    case 'day':
      return date.getDate().toString()
    case 'hour':
      return `${date.getHours()}:00`
    case 'decade':
      return `${Math.floor(date.getFullYear() / 10) * 10}s`
    default:
      return date.getFullYear().toString()
  }
}

// Get currently visible ticks
function getVisibleTicks(): Tick[] {
  return visibleTicks.value
}

// Get all ticks
function getAllTicks(): Tick[] {
  return ticks.value
}
// Watch for timescale changes and update ticks
watch(
  () => props.timescale,
  (newTimescale) => {
    if (newTimescale && timeAxisEl.value) {
      drawTicks(newTimescale, props.options.optimal_tick_width)
    }
  },
  { immediate: true },
)

// Watch for visible ticks changes and emit event
watch(
  visibleTicks,
  (newVisibleTicks) => {
    emit('visibleTicksChange', { visible_ticks: newVisibleTicks })
  },
  { deep: true },
)

// Expose methods for parent components
defineExpose({
  drawTicks,
  positionTicks,
  updateVisibleTicks,
})
</script>

<template>
  <!-- .tl-timeaxis -->
  <div
    ref="timeAxisEl"
    class="tl-timeaxis h-39px w-[100%] absolute bottom-0 left-0 z-3"
    :style="{ height: 'var(--axis-height)' }"
  >
    <!-- .tl-timeaxis-content-container -->
    <div
      class="tl-timeaxis-content-container relative bottom-0 h-39px"
      :style="{ height: 'var(--axis-height)' }"
    >
      <!-- .tl-timeaxis-major -->
      <div
        class="tl-timeaxis-major z-1 absolute"
        :style="{ backgroundColor: 'var(--color-background)' }"
      >
        <!-- .tl-timeaxis-tick -->
        <TimeNavTimeAxisTick
          v-for="tick in ticks.filter(t => t.type === 'major')"
          :key="`${tick.position}-${tick.type}`"
          class="tl-timeaxis-tick"
          :position="tick.position"
          :label="tick.label"
          :type="tick.type"
          :date="tick.date"
        />
      </div>
      <!-- .tl-timeaxis-minor -->
      <div class="tl-timeaxis-minor absolute">
        <TimeNavTimeAxisTick
          v-for="tick in ticks.filter(t => t.type === 'minor')"
          :key="`${tick.position}-${tick.type}`"
          class="tl-timeaxis-tick"
          :position="tick.position"
          :label="tick.label"
          :type="tick.type"
          :date="tick.date"
        />
      </div>
    </div>
  </div>
</template>

<style>
/* Use the global timeline.css styles for .tl-timeaxis */
/* The .tl-timeaxis class is styled in timeline.css with proper positioning */
</style>

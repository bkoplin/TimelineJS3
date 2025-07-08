<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useTimeAxis } from '../../composables/useTimeAxis'
import '../../style/base/variables.css'

interface Props {
  options: {
    optimal_tick_width: number
    height?: number
    font_size?: number
  }
  language: any
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

// Use the time axis composable
const {
  ticks,
  visibleTicks,
  drawTicks,
  positionTicks,
  updateVisibleTicks,
} = useTimeAxis(timeAxisEl, optionsRef, props.language)

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
    class="h-39px w-[100%] absolute bottom-0 left-0 z-3"
    :style="{ height: 'var(--axis-height)' }"
  >
    <!-- .tl-timeaxis-content-container -->
    <div
      class="relative bottom-0 h-39px"
      :style="{ height: 'var(--axis-height)' }"
    >
      <!-- .tl-timeaxis-major -->
      <div
        class="z-1 absolute"
        :style="{ backgroundColor: 'var(--color-background)' }"
      >
        <!-- .tl-timeaxis-tick -->
        <TimeAxisTick
          v-for="tick in ticks.filter(t => t.type === 'major')"
          :key="`${tick.position}-${tick.type}`"
          :position="tick.position"
          :label="tick.label"
          :type="tick.type"
          :date="tick.date"
        />
      </div>
      <!-- .tl-timeaxis-minor -->
      <div class="absolute">
        <TimeAxisTick
          v-for="tick in ticks.filter(t => t.type === 'minor')"
          :key="`${tick.position}-${tick.type}`"
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

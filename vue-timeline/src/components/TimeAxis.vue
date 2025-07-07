<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useTimeAxis } from '../composables/useTimeAxis'
import TimeAxisTick from './TimeAxisTick.vue'

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
  <div
    ref="timeAxisEl"
    class="tl-timeaxis"
    :style="{
      height: `${options.height || 60}px`,
    }"
  >
    <TimeAxisTick
      v-for="tick in ticks"
      :key="`${tick.position}-${tick.type}`"
      :position="tick.position"
      :label="tick.label"
      :type="tick.type"
      :date="tick.date"
    />
  </div>
</template>

<style scoped>
.tl-timeaxis {
  @apply relative w-full overflow-hidden bg-white border-b border-gray-300 bottom-0;
  /* position: relative;
  width: 100%;
  overflow: hidden;
  background: #ffffff;
  border-bottom: 1px solid #cccccc; */
}
</style>

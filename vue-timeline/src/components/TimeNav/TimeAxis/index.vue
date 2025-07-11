<script lang="ts" setup>
import '../../../style/base/variables.css'

const timelineStore = useTimelineStore()
const timeAxisEl = ref<HTMLDivElement | null>(null)
</script>

<template>
  <!-- .tl-timeaxis -->
  <div
    ref="timeAxisEl"
    class="tl-timeaxis w-full absolute bottom-0 left-0 z-3"
    :style="{ height: `${timelineStore.timeAxisHeight}px` }"
  >
    <!-- .tl-timeaxis-content-container -->
    <div
      class="tl-timeaxis-content-container w-full h-full relative bottom-0 "
    >
      <!-- .tl-timeaxis-major -->
      <div
        class="tl-timeaxis-major z-1 absolute"
        :style="{ backgroundColor: 'var(--color-background)' }"
      >
        <!-- .tl-timeaxis-tick -->
        <TimeNavTimeAxisTick
          v-for="tick in timelineStore.ticks.filter(t => t.type === 'major')"
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
          v-for="tick in timelineStore.ticks.filter(t => t.type === 'minor')"
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

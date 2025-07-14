<script lang="ts" setup>
const timelineStore = useTimelineStore()
const timeAxisEl = ref<HTMLDivElement | null>(null)
const contentContainerEl = ref<HTMLDivElement | null>(null)
const majorTicks = useTemplateRefsList<GlobalComponents['TimeAxisTick']>()
const minorTicks = useTemplateRefsList<GlobalComponents['TimeAxisTick']>()
</script>

<template>
  <!-- .tl-timeaxis -->
  <div
    ref="timeAxisEl"
    class="tl-timeaxis"
  >
    <!-- .tl-timeaxis-content-container -->
    <div
      ref="contentContainerEl"
      class="w-full h-full relative bottom-0 "
    >
      <!-- .tl-timeaxis-major -->
      <div
        class="z-1 absolute w-full h-full"
      >
        <!-- .tl-timeaxis-tick -->
        <TimeAxisTick
          v-for="tick in timelineStore.ticks.filter(t => t.type === 'major')"
          :ref="majorTicks.set"
          :key="`${tick.position}-${tick.type}`"
          class="tl-timeaxis-tick"
          :position="tick.position"
          :label="tick.label"
          :type="tick.type"
          :date="tick.date"
        />
      </div>
      <!-- .tl-timeaxis-minor -->
      <div class="absolute w-full h-full">
        <TimeAxisTick
          v-for="tick in timelineStore.ticks.filter(t => t.type === 'minor')"
          :ref="minorTicks.set"
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

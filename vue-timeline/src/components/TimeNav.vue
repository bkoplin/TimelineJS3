<script lang="ts" setup>
import type { TimeScaleOptions } from '../composables/useTimeScale'
import { useTimeScale } from '../composables/useTimeScale'

// Define props and emits

const emit = defineEmits<{
  (e: 'loaded'): void
  (e: 'change', payload: { unique_id: string }): void
  (e: 'zoomtoggle', payload: { zoom: string, show: boolean }): void
  (e: 'visible_ticks_change', payload: { visible_ticks: any }): void
  (e: 'visibleTicksChange', payload: { visible_ticks: any }): void
}>()

const timelineStore = useTimelineStore()
// Setup reactive refs
const timenavEl = ref<HTMLDivElement | null>(null)
const lineEl = ref<HTMLDivElement | null>(null)
const sliderEl = ref<HTMLDivElement | null>(null)
const sliderBackgroundEl = ref<HTMLDivElement | null>(null)
const markerContainerMaskEl = ref<HTMLDivElement | null>(null)
const markerContainerEl = ref<HTMLDivElement | null>(null)
const markerItemContainerEl = ref<HTMLDivElement | null>(null)
const timeaxisBackgroundEl = ref<HTMLDivElement | null>(null)
const timeAxisRef = ref<GlobalComponents['TimeAxis'] | null>(null)
</script>

<template>
  <!-- .tl-timenav -->
  <section
    ref="timenavEl"
    class="tl-timenav"
  >
    <!-- .tl-timenav-line -->

    <!-- .tl-timenav-slider -->
    <div
      ref="sliderEl"
      class="tl-timenav-slider absolute cursor-move z-6"
      :style="{
        height: `${timelineStore.timeNavHeight}px`,
        width: `${timelineStore.pixelWidth}px`,
      }"
    >
      <div
        ref="markerItemContainerEl"
        class="tl-timenav-item-container absolute w-full h-full"
      >
        <TimeAxisMarker
          v-for="(marker, index) in timelineStore.markers"
          :id="`marker-${marker.unique_id}`"
          :key="marker.unique_id"
          :data="marker"
          :position="marker.position"
          :options="timelineStore.options"
          :index="index"
        />
      </div>
    </div>
    <!-- </div> -->
    <!-- .tl-timenav-timeaxis-background -->
    <div
      ref="timeaxisBackgroundEl"
      class="w-full absolute bottom-0 left-0 bg-[#FFF] border-t-[1px] b-t-solid b-[#e5e5e5] z-2"
      :style="{ height: `${timelineStore.timeAxisHeight}px` }"
    >
      <TimeAxis
        ref="timeAxisRef"
        class="w-full absolute bottom-0  z-3"
        :style="{
          width: `${timelineStore.pixelWidth}px`,
          height: `${timelineStore.timeAxisHeight}px`,
        }"
      />
    </div>
    <div
      ref="lineEl"
      class="tl-timenav-line absolute top-0 left-[50%] bg-[#e5e5e5] h-full w-[1px]"
    />
  </section>
</template>

<style>
</style>

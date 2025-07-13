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
const disableSlide = ref(false)
const { x: leftPosition, isDragging } = useDraggable(sliderEl, {
  exact: true,
})
// watch(() => timelineStore.current.position, (newPosition) => {
//   if (newPosition !== undefined) {
//     leftPosition.value = newPosition * -1 + timelineStore.options.width / 2
//   }
// })
// watch([x, right], ([newX, newRight]) => {
//   console.log('newX:', newX, 'newRight:', newRight, 'disableSlide:', disableSlide.value)
//   if (newX > 0 && disableSlide.value === false) {
//   // if ((newX > 0 || newRight < 0) && disableSlide.value === false)
//     disableSlide.value = true
//     x.value = 0
//   }
//   else if (newX === 0 && disableSlide.value === true) {
//     disableSlide.value = false
//   }
//   else if (newRight < 0 && disableSlide.value === false) {
//   // if ((newX > 0 || newRight < 0) && disableSlide.value === false)
//     disableSlide.value = true
//     x.value = timelineStore.pixelRange[1] * -1
//   }
//   else if (newRight === 0 && disableSlide.value === true) {
//     disableSlide.value = false
//   }
// })

// Timeline state
</script>

<template>
  <!-- .tl-timenav -->
  <div
    ref="timenavEl"
    class="tl-timenav inset-x-0 bg-[#f2f2f2] border-t-[1px] border-t-solid border-t-[#e5e5e5] bottom-0 absolute"
    :style="{
      height: `${timelineStore.timeNavHeight}px`,
      width: `${timelineStore.options.width}px`,
    }"
  >
    <!-- .tl-timenav-line -->
    <div
      ref="lineEl"
      class="tl-timenav-line absolute top-0 left-[50%] bg-[#d9d9d9]"
      style="background-color: var(--ui-background-color);"
    />
    <!-- .tl-timenav-slider -->
    <div
      ref="sliderEl"
      class="tl-timenav-slider absolute cursor-move z-6"
      :style="{
        height: `${timelineStore.timeNavHeight}px`,
        width: `${timelineStore.pixelWidth}px`,
      }"
    >
      <!-- .tl-timenav-slide-background -->
      <!-- .tl-timenav-container-mask -->
      <!-- <div
        ref="markerContainerMaskEl"
        class="tl-timenav-container-mask absolute w-full h-full"
      > -->
      <!-- .tl-timenav-container -->
      <!-- .tl-timenav-item-container -->
      <div
        ref="markerItemContainerEl"
        class="tl-timenav-item-container absolute w-full h-full"
        :style="{ left: `${leftPosition}px` }"
      >
        <TimeAxisMarker
          v-for="(marker, index) in timelineStore.markers"
          :key="marker.unique_id"
          :data="marker"
          :position="marker.position"
          :options="timelineStore.options"
          :index="index"
        />
      </div>
    </div>
    <TimeAxis
      ref="timeAxisRef"
      class="w-full absolute bottom-0  z-3"
      :style="{
        left: `${leftPosition}px`,
        width: `${timelineStore.pixelWidth}px`,
      }"
    />
    <!-- </div> -->
    <!-- .tl-timenav-timeaxis-background -->
    <div
      ref="timeaxisBackgroundEl"
      class="w-full absolute bottom-0 left-0 bg-[#FFF] border-t-[1px] b-t-solid b-[#e5e5e5] z-2"
      :style="{ height: `${timelineStore.timeAxisHeight}px` }"
    />
  </div>
</template>

<style>
</style>

<script lang="ts" setup>
import type { GlobalComponents } from 'vue'
import { Draggable } from '@/composables/useGsap'
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
const draggableBoundsEl = ref<HTMLDivElement | null>(null)
const markerContainerEl = ref<HTMLDivElement | null>(null)
const majorTimeAxisEl = ref<HTMLDivElement | null>(null)
const minorTimeAxisEl = ref<HTMLDivElement | null>(null)
const timeaxisBackgroundEl = ref<HTMLDivElement | null>(null)
const tickContainerEl = ref<HTMLDivElement | null>(null)
const draggerEl = ref<InstanceType<GlobalComponents['GsapDraggable']>>()

const { width } = useElementSize(timenavEl)
// Demonstrate reactivity by accessing the reactive properties
const currentX = ref(0)
const majorTicks = useTemplateRefsList<GlobalComponents['TimeAxisTick']>()
const minorTicks = useTemplateRefsList<GlobalComponents['TimeAxisTick']>()
watch(() => draggerEl.value?.x ?? 0, (draggerX) => {
  currentX.value = draggerX
})
watch([() => timelineStore.current.position, () => timelineStore.pixelWidth], ([currentPosition, currentWidth]) => {
  // currentX.value = width.value / 2 - currentPosition
  draggerEl.value.x = width.value / 2 - currentPosition
  // if (isDefined(draggerEl)) {
  //   gsap.to('.tl-timenav-dragger', {
  //     x: currentWidth - currentPosition,
  //     duration: 0.3,
  //     ease: 'power2.out',
  //   })
  // }
})
</script>

<template>
  <!-- .tl-timenav -->
  <section
    id="timenav-element"
    ref="timenavEl"
  >
    <!-- .tl-timenav-line -->

    <!-- .tl-timenav-slider -->
    <div
      ref="markerContainerEl"
      class="tl-marker-container absolute"
      :style="{
        height: `${timelineStore.timeNavHeight}px`,
        width: `${timelineStore.pixelWidth}px`,
        left: `${currentX}px`,
      }"
    >
      <TimeAxisMarker
        v-for="(marker, index) in timelineStore.markers"
        :id="`${marker.unique_id}-marker`"
        :key="marker.unique_id"
        :data="marker"
        :position="marker.position"
        :options="timelineStore.options"
        :index="index"
      />
    </div>
    <!-- </div> -->
    <!-- .tl-timenav-timeaxis-background -->
    <div
      ref="tickContainerEl"
      class="tl-tick-container absolute bottom-0"
      :style="{
        height: `${timelineStore.timeNavHeight}px`,
        width: `${timelineStore.pixelWidth}px`,

      }"
    >
      <div
        ref="timeaxisBackgroundEl"
        class="w-full absolute bottom-0 left-0 bg-[#FFF] border-t-[1px] b-t-solid b-[#e5e5e5]"
        :style="{
          height: `${timelineStore.timeAxisHeight}px`,
          width: `${timelineStore.pixelWidth}px`,
        }"
      >
        <!-- .tl-timeaxis-major -->
        <div
          ref="majorTimeAxisEl"
          class="z-1 absolute h-full"
          :style="{
            left: `${currentX}px`,
          }"
        >
          <!-- .tl-timeaxis-tick -->
          <template v-for="tick in timelineStore.ticks.filter(t => t.type === 'major')">
            <TimeAxisTick
              v-if="(tick.position + currentX + width / 2) >= 0 && (tick.position + currentX + width / 2) <= timelineStore.pixelWidth"
              :ref="majorTicks.set"
              :key="`${tick.position}-${tick.type}`"
              class="tl-timeaxis-tick"
              :position="tick.position"
              :label="tick.label"
              :type="tick.type"
              :date="tick.date"
            />
          </template>
        </div>
        <!-- .tl-timeaxis-minor -->
        <div
          ref="minorTimeAxisEl"
          class="absolute h-full"
          :style="{
            left: `${currentX}px`,
          }"
        >
          <template v-for="tick in timelineStore.ticks.filter(t => t.type === 'minor')">
            <TimeAxisTick
              v-if="(tick.position + currentX + width / 2) >= 0 && (tick.position + currentX + width / 2) <= timelineStore.pixelWidth"
              :ref="minorTicks.set"
              :key="`${tick.position}-${tick.type}`"
              class="tl-timeaxis-tick"
              :position="tick.position"
              :label="tick.label"
              :type="tick.type"
              :date="tick.date"
            />
          </template>
        </div>
      </div>
    </div>
    <div
      ref="lineEl"
      class="tl-timenav-line absolute top-0 left-[50%] bg-[#e5e5e5] h-full w-[1px]"
    />
    <div
      ref="draggableBoundsEl"
      class="absolute bottom-0"
      :style="{
        height: `${timelineStore.timeNavHeight}px`,
        width: `${timelineStore.pixelWidth + width}px`,
        left: `-${width / 2}px`,
      }"
    />
    <GsapDraggable
      ref="draggerEl"
      type="x"
      class="tl-timenav-dragger absolute bottom-0 z-6 cursor-move"
      :style="{
        height: `${timelineStore.timeNavHeight}px`,
        width: `${timelineStore.pixelWidth}px`,
      }"
      :bounds="draggableBoundsEl"
    />
  </section>
</template>

<style>
</style>

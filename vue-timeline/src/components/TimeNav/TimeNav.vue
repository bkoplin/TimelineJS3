<script lang="ts" setup>
import type { GlobalComponents } from 'vue'
import type { Draggable } from '@/composables/registerGsap'
import { scaleTime } from 'd3-scale'
import { findLast, range, round, times } from 'lodash-es'
import { storeToRefs } from 'pinia'
import { useDateToPixelFn, usePixelToDateFn } from '@/composables/scaleFunctions'
// Define props and emits

const emit = defineEmits<{
  (e: 'loaded'): void
  (e: 'change', payload: { unique_id: string }): void
  (e: 'zoomtoggle', payload: { zoom: string, show: boolean }): void
  (e: 'visible_ticks_change', payload: { visible_ticks: any }): void
  (e: 'visibleTicksChange', payload: { visible_ticks: any }): void
}>()

const timelineStore = useTimelineStore()
const { eventMomentRange } = storeToRefs(timelineStore)
// Setup reactive refs
const timenavEl = useCurrentElement()
const lineEl = ref<HTMLDivElement | null>(null)
// const sliderEl = ref<HTMLDivElement | null>(null)
const draggableBoundsEl = ref<HTMLDivElement | null>(null)
const draggerEl = ref<InstanceType<GlobalComponents['DraggableContainer']>>()
const markerContainerEl = ref<HTMLDivElement | null>(null)
const timeAxisEl = ref<HTMLDivElement | null>(null)
const timeaxisBackgroundEl = ref<HTMLDivElement | null>(null)
const tickContainerEl = ref<HTMLDivElement | null>(null)
// const dateForDragger = usePixelToDateFn(tickContainerEl, eventMomentRange)
// const dateToPixel = useDateToPixelFn(tickContainerEl, eventMomentRange)
// Demonstrate reactivity by accessing the reactive properties
const x = ref(0)
const scaleX = computed(() => (pixel: number) => {
  return dayjs(scaleTime()
    .domain([timelineStore.dayjsDates.min.toDate(), timelineStore.dayjsDates.max.toDate()])
    .range([0, timelineStore.tickContainerWidth])
    .invert(pixel))
})
// watch(translation, (newX) => {
//   if (isDefined(draggerEl.value)) {
//     gsap.to(markerContainerEl.value, { x: newX })
//   }
// })
// watch(x, (newX) => {
// })
</script>

<template>
  <section>
    <div
      class="absolute left-1/2 "
      :style="{ top: `${timelineStore.timeNavHeight/2}px` }"
    >
      <div class="transform -translate-y-1/2">
        {{ x }}: {{ draggerEl?.getCurrentPosition() }}
      </div>
    </div>
    <div
      ref="timeaxisBackgroundEl"
      class="absolute bottom-0 bg-[#FFF] border-t-[1px] b-t-solid b-[#e5e5e5]"
      :style="{
        width: timelineStore.tickContainerBoundsStyle.width,
        left: timelineStore.tickContainerBoundsStyle.left,
        height: `${timelineStore.timeAxisHeight}px`,
      }"
    />
    <DraggableContainer
      ref="draggerEl"
      type="x"
      :minimum-movement="10"
      :drag-clickables="false"
      :target-x="timelineStore.current.x"
    >
      <!-- <template #bounds>
        <div
          class="absolute bottom-0"
          :style="timelineStore.tickContainerBoundsStyle"
        />
      </template> -->
      <div
        :style="{
          height: `${timelineStore.timeNavHeight}px`,
          width: `${timelineStore.tickContainerWidth}px`,
        }"
      >
        <div
          ref="markerContainerEl"
          class="tl-marker-container relative"
          :style="{
            height: `${timelineStore.timeNavHeight}px`,
            width: `${timelineStore.tickContainerWidth}px`,
          }"
        >
          <template v-for="(marker, index) in timelineStore.markers">
            <TimeAxisMarker
              v-if="!marker.isTitle"
              :id="`${marker.unique_id}-marker`"
              :key="marker.unique_id"
              :data="marker"
              :position="marker.position"
              :options="timelineStore.options"
              :index="index"
            />
          </template>
        </div>
        <div
          ref="tickContainerEl"
          class="absolute bottom-0"
          :style="{
            height: `${timelineStore.timeAxisHeight}px`,
          }"
        >
          <div
            ref="timeAxisEl"
            class="absolute h-full bottom-0"
          >
            <div
              v-for="(tick, i) in timelineStore.dayjsTicks.ticks"
              :key="`tick-${i}`"
              class="absolute h-full"
              :style="{
                left: `${tick.position}px`,
              }"
            >
              <template v-if="tick.type === 'major'">
                <div
                  :key="`major-${i}`"
                  class="absolute top-0 bg-amber w-[1.5px] h-4"
                />
                <div
                  :key="`major-${i}-label`"
                  class="absolute left-0 bottom-0 leading-none transform -translate-x-1/2 text-sm whitespace-nowrap"
                >
                  {{ tick.dayjs.format(timelineStore.scaleStepper.current.majorTickFormat) }}
                </div>
              </template>
              <template v-else-if="tick.type === 'middle'">
                <div
                  :key="`middle-${i}`"
                  class="absolute top-0 bg-emerald w-[1.5px] h-3"
                />
                <div
                  :key="`middle-${i}-label`"
                  class="absolute bottom-0 left-0 transform -translate-x-1/2 text-xs -translate-y-3/4 whitespace-nowrap"
                >
                  {{ tick.dayjs.format(timelineStore.scaleStepper.current.middleTickFormat) }}
                </div>
              </template>
              <div
                v-else
                :key="`minor-${i}`"
                class="absolute top-0 bg-slate w-[1px] h-2"
              />
            </div>
          </div>
        </div>
      </div>
    </DraggableContainer>

    <div
      ref="lineEl"
      class="tl-timenav-line absolute top-0 bg-black h-full w-[1px] transform -translate-x-[0.5px]"
      :style="{
        height: `${timelineStore.timeNavHeight}px`,
        left: `${timelineStore.options.width / 2}px`,
      }"
    />
  </section>
</template>

<style>
</style>

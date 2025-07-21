<script lang="ts" setup>
import type { GlobalComponents } from 'vue'
import type { Draggable } from '@/composables/useGsap'
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
const draggerEl = ref<InstanceType<GlobalComponents['GsapDraggable']>>()
const markerContainerEl = ref<HTMLDivElement | null>(null)
const timeAxisEl = ref<HTMLDivElement | null>(null)
const timeaxisBackgroundEl = ref<HTMLDivElement | null>(null)
const tickContainerEl = ref<HTMLDivElement | null>(null)
// const dateForDragger = usePixelToDateFn(tickContainerEl, eventMomentRange)
// const dateToPixel = useDateToPixelFn(tickContainerEl, eventMomentRange)
// Demonstrate reactivity by accessing the reactive properties
const x = ref(0)
const translation = computed(() => (x.value + timelineStore.tickCalculations.minX))
watch(() => timelineStore.current.position, async (currentPosition, oldPosition) => {
  await until(() => draggerEl.value?.containerRef).toBeTruthy()
  if (oldPosition !== currentPosition && currentPosition !== undefined) {
    x.value = (currentPosition || 0)
    gsap.to(draggerEl.value!.containerRef!, { x: (currentPosition || 0) - (oldPosition || 0) })
  }
  // gsap.to(markerContainerEl.value, { x: newX })
}, { immediate: true })
watch(() => timelineStore.options.width, (newMinX) => {
  x.value = x.value - newMinX / 2
}, { immediate: true })
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
    <div class="absolute top-0 left-1/2 transform -translate-x-1/2">
      {{ round(x) }}, {{ timelineStore.tickCalculations.pixelToDateScale(x) }}
    </div>
    <div
      ref="markerContainerEl"
      class="tl-marker-container absolute bottom-0"
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
    <GsapDraggable
      ref="draggerEl"
      :style="{
        height: `${timelineStore.timeNavHeight}px`,
        width: `${timelineStore.tickContainerWidth}px`,
      }"
      type="x"
      class="absolute bottom-0"
      :minimum-movement="10"
      :drag-clickables="false"
      @drag="x -= $event.deltaX"
    >
      <!-- <template #bounds>
        <div
          class="absolute bottom-0"
          :style="{
            left: `${timelineStore.tickCalculations.minX}px`,
            right: `${timelineStore.tickCalculations.maxX}px`,
            height: `${timelineStore.timeAxisHeight}px`,
          }"
        />
      </template> -->
      <template #default>
        <div
          ref="tickContainerEl"
          class="absolute bottom-0"
          :style="{
            height: `${timelineStore.timeAxisHeight}px`,
          }"
        >
          <div
            ref="timeaxisBackgroundEl"
            class="absolute bottom-0 bg-[#FFF] border-t-[1px] b-t-solid b-[#e5e5e5] dir-rtl h-full"
            :style="{
              width: `${timelineStore.tickContainerWidth * 2}px`,
              left: `-${timelineStore.tickContainerWidth / 2}px`,
            }"
          />
          <div
            ref="timeAxisEl"
            class="absolute h-full bottom-0"
            :style="{
              width: `${timelineStore.tickContainerWidth}px`,
            }"
          >
            <div
              v-for="(tick, i) in timelineStore.tickCalculations.ticks"
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
                  {{ tick.label }}
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
                  {{ tick.label }}
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
      </template>
    </GsapDraggable>

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

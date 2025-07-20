<script lang="ts" setup>
import type { GlobalComponents } from 'vue'
import type { Draggable } from '@/composables/useGsap'
import { findLast, range, times } from 'lodash-es'
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
const draggerEl = ref<HTMLElement>()
const markerContainerEl = ref<HTMLDivElement | null>(null)
const timeAxisEl = ref<HTMLDivElement | null>(null)
const timeaxisBackgroundEl = ref<HTMLDivElement | null>(null)
const tickContainerEl = ref<HTMLDivElement | null>(null)
const tickContainerWidth = computed(() => Math.max(timelineStore.options.optimal_tick_width * timelineStore.tickCalulations.total, timelineStore.options.width) + timelineStore.options.width)
const ticks = computed(() => {
  const calculatedTicks = range(-timelineStore.options.width / 2, tickContainerWidth.value + timelineStore.options.width / 2, timelineStore.options.optimal_tick_width).map((pixelPosition, i) => {
    const date = timelineStore.pixelToDate(pixelPosition)
    const tickType = i % timelineStore.tickCalulations.perMajor === 0 ? 'major' : (i % timelineStore.tickCalulations.perMiddle === 0 ? 'middle' : 'minor')
    return {
      position: pixelPosition,
      date,
      type: tickType,
      label: `${tickType}TickFormat` in timelineStore.scaleStepper.current ? moment(date).format(timelineStore.scaleStepper.current[`${tickType}TickFormat`]) : '',
    }
  })

  return calculatedTicks
})
// const dateForDragger = usePixelToDateFn(tickContainerEl, eventMomentRange)
// const dateToPixel = useDateToPixelFn(tickContainerEl, eventMomentRange)
// Demonstrate reactivity by accessing the reactive properties
const bounds = computed(() => {
  return { maxX: timelineStore.options.width / 2, minX: timelineStore.options.width - ticks.value[ticks.value.length - 1].position, maxY: 0, minY: 0 }
})
const {x, y, position, style} = useDraggable(draggerEl, {
  axis: 'x',
  preventDefault: true,
  stopPropagation: true,
  exact: true,
  onStart(position, event) {
      console.log('Drag started', position, event)
  },
})
const transformation = computed(() => {
  return x.value
})
const dateToPixel = computed(() => dateToPixelFn([-timelineStore.options.width / 2, tickContainerWidth.value + timelineStore.options.width / 2], timelineStore.eventMomentRange))
watch(() => timelineStore.current, ({ start_date }) => {
  x.value = dateToPixel.value(start_date?.toDate())
  // gsap.to([markerContainerEl.value, timeAxisEl.value], { duration: 0.25, x: position * -1 + width.value / 2 })
})
// watch([() => timelineStore.current.position, () => timelineStore.pixelWidth], ([currentPosition, currentWidth]) => {
//   // currentX.value = width.value / 2 - currentPosition
//   draggerEl.value.x = width.value / 2 - currentPosition
//   // if (isDefined(draggerEl)) {
//   //   gsap.to('.tl-timenav-dragger', {
//   //     x: currentWidth - currentPosition,
//   //     duration: 0.3,
//   //     ease: 'power2.out',
//   //   })
//   // }
// })
// onMounted(() => {
// let smoother = ScrollSmoother.create({
//   smooth: 2,
//   effects: true,
//   normalizeScroll: true,
//   wrapper: '#smooth-wrapper',
//   content: '#smooth-content',

// })
// ScrollTrigger.create({
//   trigger: markerContainerEl.value,
//   horizontal: true,
//   scrub: true,
//   pin: true,
//   markers: true,
//   snap:
// })
// })
</script>

<template>
  <section>
    <div class="absolute top-0 left-1/2 transfor -translate-x-1/2">
      {{ x }}
    </div>
    <div
    ref="draggerEl"
    :style="{
        height: `${timelineStore.timeNavHeight}px`,
        width: `${timelineStore.tickContainerWidth}px`,
        transform: `translateX(${x - timelineStore.tickContainerWidth}px)`,
      }"
    ></div>
    <div
      ref="markerContainerEl"
      class="tl-marker-container"
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
      ref="lineEl"
      class="tl-timenav-line absolute top-0 bg-black h-full w-[1px] transform -translate-x-[0.5px]"
      :style="{
        height: `${timelineStore.timeNavHeight}px`,
        left: `${timelineStore.options.width / 2}px`,
      }"
    />
    <div
      ref="tickContainerEl"
      class="tl-tick-container absolute bottom-0"
      :style="{
      }"
    >
    <div
    ref="timeaxisBackgroundEl"
    class="relative bottom-0 left-0 bg-[#FFF] border-t-[1px] b-t-solid b-[#e5e5e5] dir-rtl"
    :style="{
      height: `${timelineStore.timeAxisHeight}px`,
      width: `${tickContainerWidth * 2}px`,
      left: `-${tickContainerWidth / 2}px`,
    }"
      />
      <div
      ref="timeAxisEl"
      class="absolute h-full bottom-0"
      :style="{
        height: `${timelineStore.timeAxisHeight}px`,
        width: `${tickContainerWidth}px`,
        left: `-${timelineStore.options.width / 2}px`,
        transform: `translateX(${x - timelineStore.tickContainerWidth}px)`,
        }"
      >
        <div
          v-for="(tick, i) in ticks"
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

  </section>
</template>

<style>
</style>

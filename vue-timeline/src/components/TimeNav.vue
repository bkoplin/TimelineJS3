<script lang="ts" setup>
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
const markerContainerEl = ref<HTMLDivElement | null>(null)
const majorTimeAxisEl = ref<HTMLDivElement | null>(null)
const minorTimeAxisEl = ref<HTMLDivElement | null>(null)
const timeaxisBackgroundEl = ref<HTMLDivElement | null>(null)
const draggerEl = ref<HTMLDivElement | null>(null)
const tickContainerEl = ref<HTMLDivElement | null>(null)
// const { x: markerContainerX } = useDraggable(markerContainerEl, {
//   axis: 'x',
//   initialValue: { x: 0, y: 0 },
// })
const dragPosition = ref(0)
const { x: majorTimeAxisX } = useElementBounding(majorTimeAxisEl)
const { x: minorTimeAxisX } = useElementBounding(minorTimeAxisEl)
const { x: markerContainerX } = useElementBounding(markerContainerEl)
watch(dragPosition, (newValue) => {
  majorTimeAxisX.value = newValue
  minorTimeAxisX.value = newValue
  markerContainerX.value = newValue
})
const majorTicks = useTemplateRefsList<GlobalComponents['TimeAxisTick']>()
const minorTicks = useTemplateRefsList<GlobalComponents['TimeAxisTick']>()
const { width } = useElementBounding(timenavEl)
let draggable: Draggable[]
onMounted(() => {
  draggable = Draggable.create(draggerEl.value, {
    type: 'x',
    bounds: {
      minX: timelineStore.pixelWidth * -1 + width.value,
      maxX: 0,
    },
    onDrag() {
      dragPosition.value = this.x + width.value / 2
    },
    zIndexBoost: true,
  })
})
watch(() => timelineStore.pixelWidth, (newWidth) => {
  if (draggable && draggable.length > 0) {
    draggable[0].applyBounds({
      minX: newWidth * -1 + width.value,
      maxX: 0,
    })
  }
})
// watch(() => timelineStore.current.position, (currentPosition) => {
//   if (isDefined(draggable)) {
//     draggable[0].
//   }
// })
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
      }"
    >
      <TimeAxisMarker
        v-for="(marker, index) in timelineStore.markers"
        :id="`${marker.unique_id}-marker`"
        :key="marker.unique_id"
        :data="marker"
        :position="marker.position + dragPosition"
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
        >
          <!-- .tl-timeaxis-tick -->
          <template v-for="tick in timelineStore.ticks.filter(t => t.type === 'major')">
            <TimeAxisTick
              v-if="(tick.position + dragPosition + width / 2) >= 0 && (tick.position + dragPosition + width / 2) <= timelineStore.pixelWidth"
              :ref="majorTicks.set"
              :key="`${tick.position}-${tick.type}`"
              class="tl-timeaxis-tick"
              :position="tick.position + dragPosition"
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
        >
          <template v-for="tick in timelineStore.ticks.filter(t => t.type === 'minor')">
            <TimeAxisTick
              v-if="(tick.position + dragPosition + width / 2) >= 0 && (tick.position + dragPosition + width / 2) <= timelineStore.pixelWidth"
              :ref="minorTicks.set"
              :key="`${tick.position}-${tick.type}`"
              class="tl-timeaxis-tick"
              :position="tick.position + dragPosition"
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
      ref="draggerEl"
      class="tl-timenav-dragger absolute bottom-0 z-6 cursor-move"
      :style="{
        height: `${timelineStore.timeNavHeight}px`,
        width: `${timelineStore.pixelWidth - dragPosition}px`,

      }"
    />
  </section>
</template>

<style>
</style>

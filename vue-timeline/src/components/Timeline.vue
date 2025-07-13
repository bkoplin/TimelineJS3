<script lang="ts" setup>
import type {
  TimelineChangeEvent,
  TimelineData,
  TimelineNavEvent,
  TimelineOptions,
  TimelineZoomEvent,
} from '../types'
import { delay, isEmpty, omitBy } from 'lodash-es'
import { storeToRefs } from 'pinia'
import { shake } from 'radash'
import { useTimelineStore } from '../stores/timelineStore.ts'

// Define props with TypeScript
const props = defineProps<{
  data: TimelineData
  options?: TimelineOptions
}>()

// Define emits with TypeScript
const emit = defineEmits<{
  (e: 'ready'): void
  (e: 'loaded', payload: any): void
  (e: 'changed', payload: TimelineChangeEvent): void
  (e: 'colorchange', payload: TimelineChangeEvent): void
  (e: 'navNext', payload: any): void
  (e: 'navPrevious', payload: any): void
  (e: 'zoomIn', payload: TimelineZoomEvent): void
  (e: 'zoomOut', payload: TimelineZoomEvent): void
  (e: 'backToStart', payload: TimelineNavEvent): void
  (e: 'forwardToEnd', payload: TimelineNavEvent): void
}>()
const timelineStore = useTimelineStore()
const optionsWithoutDimensions = reactiveOmit(timelineStore.options, ['height', 'width', 'marker_height_min', 'marker_height_min', 'timenav_height_percentage', 'timenav_mobile_height_percentage', 'menubar_height', 'timenav_height', 'marker_width_min', 'storyslider_height'])

// Setup reactive refs with Vue Macros
const timelineContainer = ref<HTMLElement | null>(null)
const { width, height } = useElementSize(timelineContainer)

// Use Vue macros reactivity transform for cleaner code
const ready = ref(false)

onMounted(async () => {
  if (props.options) {
    timelineStore.setOptions(shake(props.options))
  }
  if (!isEmpty(shake(props.data)))
    timelineStore.setData(props.data)
  if (isDefined(timelineStore.options.start_at_slide)) {
    if (typeof timelineStore.options.start_at_slide === 'number') {
      timelineStore.index = timelineStore.options.start_at_slide
    }
    else if (typeof timelineStore.options.start_at_slide === 'string') {
      timelineStore.goTo(timelineStore.options.start_at_slide)
    }
  }
  else {
    timelineStore.index = 0 // Default to first slide if no valid start
  }
  watch([width, height], ([newWidth, newHeight]) => {
    if (newHeight > 0)
      timelineStore.options.height = newHeight
    if (newWidth > 0)
      timelineStore.options.width = newWidth
  }, { immediate: true })
  delay(() => ready.value = true, 1500)
})
watch(
  () => props.data,
  (newData) => {
    if (!isEmpty(shake(newData))) {
      timelineStore.setData(newData)
    }
  },
  { deep: true },
)

watch(
  () => optionsWithoutDimensions,
  (newOptions) => {
    if (!isEmpty(shake(newOptions))) {
      timelineStore.setOptions(shake(newOptions))
    }
  },
  { deep: true },
)
// Default configuration options - now moved to store
// const defaultOptions: TimelineOptions = { ... } // Removed since it's in the store

// Process options and data when they change
</script>

<template>
  <!-- .tl-timeline -->
  <section class="h-screen w-screen p-5 h-full w-full min-h-[600px] relative overflow-hidden overscroll-none">
    <div
      ref="timelineContainer"
      class="tl-timeline font-sans h-full w-full border border-gray-300 shadow-md relative overflow-hidden overscroll-none"
    >
      <!-- .tl-storyslider -->
      <StorySlider
        v-if="ready && timelineStore.stepNames.length > 0"
        class="w-full h-full relative z-8 select-none"
      />
      <TimeNav
        v-if="ready && timelineStore.stepNames.length > 0"
        class="tl-timenav bg-[#f2f2f2] border-t-[1px] border-t-solid border-t-[#e5e5e5] bottom-0 relative"
        :style="{
          height: `${timelineStore.timeNavHeight}px`,
          width: `${timelineStore.options.width}px`,
        }"
      />
      <MenuBar
        v-if="ready && timelineStore.stepNames.length > 0"
        class="tl-menubar absolute z-11 bottom-0 left-0"
        :style="{ height: `${timelineStore.timeNavHeight}px` }"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center"
      >
        <FontAwesomeLayers
          class="text-[6em]"
          full-width
        >
          <FontAwesomeIcon
            :icon="byPrefixAndName.fat.cog"
            spin
          />
          <FontAwesomeLayersText
            value="Loading Timeline..."
            transform="down-30"
            class="text-gray-700 whitespace-nowrap text-[0.5em]"
          />
        </FontAwesomeLayers>
      </div>
    </div>
  </section>
</template>

<style>
@import '../style/index.css';
</style>

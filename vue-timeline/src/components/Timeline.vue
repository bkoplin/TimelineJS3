<script lang="ts" setup>
import type {
  TimelineChangeEvent,
  TimelineData,
  TimelineNavEvent,
  TimelineOptions,
  TimelineZoomEvent,
} from '../types'
import { isEmpty, omitBy } from 'lodash-es'
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
// Watch for prop changes and update store

// Setup reactive refs with Vue Macros
const timelineContainer = ref<HTMLElement | null>(null)
const { width, height } = useElementSize(timelineContainer)

// Use Vue macros reactivity transform for cleaner code
const message = ref<string>('Loading timeline...')
const ready = ref(false)

// Browser location for handling hash changes

const processedData = computed(() => timelineStore.processedData)
onMounted(() => {
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
  ready.value = true
  // useEventListener(document, 'keydown', (e) => {
  //   if (e.key === 'ArrowLeft') {
  //     emit('navPrevious', { direction: 'previous' })
  //     timelineStore.goToPrevious()
  //   }
  //   else if (e.key === 'ArrowRight') {
  //     emit('navNext', { direction: 'next' })
  //     timelineStore.goToNext()
  //   }
  // })
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
  <div
    ref="timelineContainer"
    class="tl-timeline font-sans text-base lh-normal overflow-hidden relative border border-gray-300 shadow-md relative h-full w-full min-h-[600px]"
  >
    <!-- .tl-storyslider -->
    <StorySlider
      v-if="ready && timelineStore.stepNames.length > 0"
    />
    <TimeNav
      v-if="ready && timelineStore.stepNames.length > 0"
      class="tl-timenav"
    />
    <MenuBar
      v-if="ready && timelineStore.stepNames.length > 0"
      class="tl-menubar"
    />
  </div>
  <div
    v-if="!(ready && timelineStore.stepNames.length > 0)"
    class="w-full h-full v-middle text-center"
  >
    Loading timeline data...
  </div>
</template>

<style scoped>
</style>

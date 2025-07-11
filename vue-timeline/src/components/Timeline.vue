<script lang="ts" setup>
// import { easeInOutQuint } from '../core/animation/Ease'
// import { english } from '../core/language/Language.ts'
import type { TimelineConfig } from '../core/TimelineConfig.ts'
import type {
  TimelineChangeEvent,
  TimelineData,
  TimelineNavEvent,
  TimelineOptions,
  TimelineZoomEvent,
} from '../types'
import { breakpointsTailwind } from '@vueuse/core'
import { useRouteHash } from '@vueuse/router'
import { hexToRgb } from '../core/Util.ts'
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

// Watch for prop changes and update store
watch(
  () => props.data,
  (newData) => {
    if (newData) {
      timelineStore.setData(newData)
    }
  },
  { deep: true, immediate: true },
)

watch(
  () => props.options,
  (newOptions) => {
    if (newOptions) {
      timelineStore.setOptions(newOptions)
    }
  },
  { deep: true, immediate: true },
)

tryOnBeforeMount(() => {
  timelineStore.setData(props.data)
  if (props.options) {
    timelineStore.setOptions(props.options)
  }
})
// Setup reactive refs with Vue Macros
const timelineContainer = ref<HTMLElement | null>(null)
const { width, height } = useElementSize(timelineContainer)

const timeNavComponent = shallowRef<GlobalComponents['TimeNav'] | null>(null)
const storySliderComponent = shallowRef<GlobalComponents['StorySlider'] | null>(null)
const menuBarComponent = shallowRef<GlobalComponents['MenuBar'] | null>(null)

// Use Vue macros reactivity transform for cleaner code
const loaded = ref(false)
const message = ref<string>('Loading timeline...')
const config = ref<TimelineConfig | null>(null)
const currentId = ref<string | null>(null)
const ready = useMounted()

// Browser location for handling hash changes
const { hash } = toRefs(toReactive(useBrowserLocation()))

const processedData = computed(() => timelineStore.processedData)
useResizeObserver(timelineContainer, (entries) => {
  const [el] = entries
  if (el.contentRect.height > 0 && el.contentRect.width > 0) {
    timelineStore.options.height = el.contentRect.height
    timelineStore.options.width = el.contentRect.width
  }
})
// Default configuration options - now moved to store
// const defaultOptions: TimelineOptions = { ... } // Removed since it's in the store

// Process options and data when they change
watch(() => props.options, (newOptions) => {
  if (newOptions) {
    processOptions(newOptions)
  }
}, { deep: true, immediate: true })

watch(() => props.data, (newData) => {
  if (newData) {
    timelineStore.setData(newData)
  }
}, { deep: true, immediate: true })

function processOptions(newOptions: TimelineOptions): void {
  // Process background color
  if (typeof newOptions.default_bg_color === 'string') {
    const parsed = hexToRgb(newOptions.default_bg_color)
    if (parsed) {
      newOptions.default_bg_color = parsed
    }
    else {
      delete newOptions.default_bg_color
      console.warn('Invalid default background color. Ignoring.')
    }
  }

  // Merge options through store
  timelineStore.setOptions(newOptions)
}
</script>

<template>
  <!-- .tl-timeline -->
  <div
    ref="timelineContainer"
    class="tl-timeline font-sans w-full h-full text-base lh-normal overflow-hidden relative min-h-[600px] border border-gray-300 shadow-md relative"
  >
    <!-- .tl-storyslider -->
    <StorySlider
      v-if="processedData"
      ref="storySliderComponent"
    />
    <TimeNav
      v-if="ready"
      ref="timeNavComponent"
      class="tl-timenav"
    />

    <MenuBar
      v-if="ready"
      ref="menuBarComponent"
      class="tl-menubar"
    />

    <div
      v-if="!processedData"
      class="tl-message-full"
    >
      {{ message }}
    </div>
  </div>
</template>

<style scoped>
</style>

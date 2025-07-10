<script lang="ts" setup>
import type {
  TimelineChangeEvent,
  TimelineData,
  TimelineNavEvent,
  TimelineOptions,
  TimelineZoomEvent,
} from '../types'
import { breakpointsTailwind } from '@vueuse/core'
// import { easeInOutQuint } from '../core/animation/Ease'
// import { english } from '../core/language/Language.ts'
import { TimelineConfig } from '../core/TimelineConfig.ts'
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
const ready = ref(false)
const _loaded = ref({ timenav: false, storyslider: false })

// Browser location for handling hash changes
const location = useBrowserLocation()
const hash = computed(() => location.value.hash)

// Language from store
const i18n = computed(() => timelineStore.language)

// Computed property to transform processed data for StorySlider
const processedData = computed(() => timelineStore.processedData)

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

// Watch for hash changes
watch(hash, (newHash) => {
  if (timelineStore.options.hash_bookmark && newHash && newHash.indexOf('#') === 0) {
    goToId(newHash.replace('#', ''))
  }
})

// Watch for container size changes
useResizeObserver(timelineContainer, () => {
  if (ready.value) {
    updateDisplay()
  }
})

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

  if (ready.value) {
    updateDisplay()
  }
}

function initData(data: TimelineData): void {
  if (data) {
    try {
      config.value = new TimelineConfig(data)
      if (config.value.isValid()) {
        config.value.validate()
        if (config.value.isValid()) {
          onDataLoaded()
        }
        else {
          const errs = config.value.getErrors()
          message.value = `Error: ${errs.map(e => e.message_key).join(', ')}`
        }
      }
      else {
        message.value = 'Invalid timeline configuration'
      }
    }
    catch (e: any) {
      message.value = `Error initializing timeline: ${e.message || e}`
    }
  }
}

function onDataLoaded(): void {
  nextTick(() => {
    // Hide message
    message.value = ''
    loaded.value = true

    // Set ready state
    ready.value = true
    emit('ready')

    // Check if we should start at end or at a specific slide
    if (timelineStore.options.start_at_end || (timelineStore.options.start_at_slide && config.value && timelineStore.options.start_at_slide > config.value.events.length)) {
      goToEnd()
    }
    else if (timelineStore.options.start_at_slide) {
      goTo(timelineStore.options.start_at_slide)
    }

    // Handle hash bookmark
    if (timelineStore.options.hash_bookmark && hash.value) {
      const eventId = hash.value.replace('#', '')
      if (eventId) {
        goToId(eventId)
      }
      else {
        updateHashBookmark(currentId.value)
      }
    }
  })
}

function onKeydown(event: KeyboardEvent): void {
  if (config.value) {
    const keyName = event.key
    const currentSlide = getSlideIndex(currentId.value as string)
    const _n = config.value.events.length - 1
    const lastSlide = config.value.title ? _n + 1 : _n
    const firstSlide = 0

    if (keyName === 'ArrowLeft') {
      if (currentSlide !== firstSlide) {
        goToPrev()
      }
    }
    else if (keyName === 'ArrowRight') {
      if (currentSlide !== lastSlide) {
        goToNext()
      }
    }
  }
}

// Set up keyboard event listener
useEventListener(document, 'keydown', onKeydown)

function onColorChange(_e: any): void {
  emit('colorchange', { unique_id: currentId.value as string })
}

function onSlideChange(slide: any): void {
  const unique_id = slide.id || slide.unique_id
  if (currentId.value !== unique_id) {
    currentId.value = unique_id
    timeNavComponent.value?.goToId(currentId.value)
    onChange({ unique_id })
  }
}

function onTimeNavChange(e: { unique_id: string }): void {
  if (currentId.value !== e.unique_id) {
    currentId.value = e.unique_id
    storySliderComponent.value?.goToId(currentId.value)
    onChange(e)
  }
}

function onChange(_e: any): void {
  emit('changed', { unique_id: currentId.value as string })
  if (timelineStore.options.hash_bookmark && currentId.value) {
    updateHashBookmark(currentId.value)
  }
}

function onZoomToggle(e: { zoom: string, show: boolean }): void {
  if (e.zoom === 'in') {
    menuBarComponent.value?.toogleZoomIn(e.show)
  }
  else if (e.zoom === 'out') {
    menuBarComponent.value?.toogleZoomOut(e.show)
  }
}

function onVisibleTicksChange(e: { visible_ticks: any }): void {
  menuBarComponent.value?.changeVisibleTicks(e.visible_ticks)
}

function onForwardToEnd(_e: any): void {
  goToEnd()
  emit('forwardToEnd', { unique_id: currentId.value as string })
}

function onBackToStart(_e: any): void {
  goToStart()
  emit('backToStart', { unique_id: currentId.value as string })
}

function onZoomIn(_e: any): void {
  timeNavComponent.value?.zoomIn()
  emit('zoomIn', { zoom_level: timelineStore.options.scale_factor || 1 })
}

function onZoomOut(_e: any): void {
  timeNavComponent.value?.zoomOut()
  emit('zoomOut', { zoom_level: timelineStore.options.scale_factor || 1 })
}

function onTimeNavLoaded(): void {
  _loaded.value.timenav = true
  checkLoaded()
}

function onStorySliderLoaded(): void {
  _loaded.value.storyslider = true
  checkLoaded()
}

function onStorySliderNext(e: any): void {
  emit('navNext', e)
}

function onStorySliderPrevious(e: any): void {
  emit('navPrevious', e)
}

function checkLoaded(): void {
  if (_loaded.value.storyslider && _loaded.value.timenav) {
    emit('loaded', config.value)
  }
}

function updateDisplay(animate = false, d?: number): void {
  const _duration = d || timelineStore.options.duration || 1000

  // Update width and height in store
  timelineStore.setOptions({
    width: width.value,
    height: height.value,
  })

  // Check if skinny
  let _display_class = timelineStore.options.base_class || 'tl-timeline'
  if (width.value <= (timelineStore.options.skinny_size || 650)) {
    _display_class += ' tl-skinny'
    timelineStore.setOptions({ layout: 'portrait' })
  }
  else if (width.value <= (timelineStore.options.medium_size || 800)) {
    _display_class += ' tl-medium'
    timelineStore.setOptions({ layout: 'landscape' })
  }
  else {
    timelineStore.setOptions({ layout: 'landscape' })
  }

  // Detect Mobile and Update Orientation
  const isTouch = useSupported(() => 'ontouchstart' in window)
  const { orientation } = useScreenOrientation()
  if (isTouch.value) {
    // Map screen orientation to timeline layout
    if (orientation.value?.includes('portrait')) {
      timelineStore.setOptions({ layout: 'portrait' })
    }
    else if (orientation.value?.includes('landscape')) {
      timelineStore.setOptions({ layout: 'landscape' })
    }
  }

  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = breakpoints.smaller('sm')

  if (isMobile.value) {
    _display_class += ' tl-mobile'
    // Set TimeNav Height
    const timenav_height = calculateTimeNavHeight(
      timelineStore.options.timenav_height,
      timelineStore.options.timenav_mobile_height_percentage,
    )
    timelineStore.setOptions({ timenav_height })
  }
  else {
    // Set TimeNav Height
    const timenav_height = calculateTimeNavHeight(timelineStore.options.timenav_height)
    timelineStore.setOptions({ timenav_height })
  }

  // LAYOUT
  if (timelineStore.options.layout === 'portrait') {
    // Portrait
    _display_class += ' tl-layout-portrait'
  }
  else {
    // Landscape
    _display_class += ' tl-layout-landscape'
  }

  // Set StorySlider Height
  const storyslider_height = (timelineStore.options.height as number - (timelineStore.options.timenav_height as number))
  timelineStore.setOptions({ storyslider_height })

  if (i18n.value.direction === 'rtl') {
    _display_class += ' tl-rtl'
  }

  // Update component displays
  timeNavComponent.value?.updateDisplay(width.value, timelineStore.options.timenav_height as number, animate)
  storySliderComponent.value?.updateDisplay(
    width.value,
    timelineStore.options.storyslider_height as number,
    animate,
    timelineStore.options.layout as string,
  )

  // Apply class
  if (timelineContainer.value) {
    // Class application logic could go here
  }
}

function calculateTimeNavHeight(timenav_height?: number | null, timenav_height_percentage?: number): number {
  let height = 0

  if (timenav_height) {
    height = timenav_height
  }
  else {
    if (timelineStore.options.timenav_height_percentage || timenav_height_percentage) {
      if (timenav_height_percentage) {
        height = Math.round(((timelineStore.options.height as number) / 100) * timenav_height_percentage)
      }
      else {
        height = Math.round(((timelineStore.options.height as number) / 100) * (timelineStore.options.timenav_height_percentage as number))
      }
    }
  }

  // Set new minimum based on how many rows needed
  if (timeNavComponent.value && timeNavComponent.value.ready) {
    const minHeight = timeNavComponent.value.getMinimumHeight()
    if ((timelineStore.options.timenav_height_min as number) < minHeight) {
      timelineStore.setOptions({ timenav_height_min: minHeight })
    }
  }

  // If height is less than minimum set it to minimum
  if (height < (timelineStore.options.timenav_height_min as number)) {
    height = timelineStore.options.timenav_height_min as number
  }

  height = height - ((timelineStore.options.marker_padding as number) * 2)

  return height
}

function getSlideIndex(id: string): number {
  if (config.value) {
    if (config.value.title && config.value.title.unique_id === id) {
      return 0
    }
    for (let i = 0; i < config.value.events.length; i++) {
      if (id === config.value.events[i].unique_id) {
        return config.value.title ? i + 1 : i
      }
    }
  }
  return -1
}

function updateHashBookmark(id: string | null): void {
  if (id) {
    const hash = `#${id.toString()}`
    window.history.replaceState(null, 'Browsing TimelineJS', hash)
  }
}

// Public API methods
function goToId(id: string): void {
  if (currentId.value !== id) {
    currentId.value = id
    timeNavComponent.value?.goToId(currentId.value)
    storySliderComponent.value?.goToId(currentId.value)
    emit('changed', { unique_id: currentId.value })
  }
}

function goTo(n: number): void {
  if (n < 0 || !config.value) {
    return
  }

  try {
    if (config.value.title) {
      if (n === 0) {
        const titleId = config.value.title.unique_id
        if (titleId) {
          goToId(titleId)
        }
      }
      else {
        const eventId = config.value.events[n - 1]?.unique_id
        if (eventId) {
          goToId(eventId)
        }
      }
    }
    else {
      const eventId = config.value.events[n]?.unique_id
      if (eventId) {
        goToId(eventId)
      }
    }
  }
  catch {
    // Ignore errors when trying to navigate to invalid slides
  }
}

function goToStart(): void {
  goTo(0)
}

function goToEnd(): void {
  if (config.value) {
    const _n = config.value.events.length - 1
    goTo(config.value.title ? _n + 1 : _n)
  }
}

function goToPrev(): void {
  if (currentId.value) {
    goTo(getSlideIndex(currentId.value) - 1)
    focusContainer()
  }
}

function goToNext(): void {
  if (currentId.value) {
    goTo(getSlideIndex(currentId.value) + 1)
    focusContainer()
  }
}

function focusContainer(): void {
  timelineContainer.value?.focus()
}

function zoomIn(): void {
  timeNavComponent.value?.zoomIn()
}

function zoomOut(): void {
  timeNavComponent.value?.zoomOut()
}

function setZoom(level: number): void {
  timeNavComponent.value?.setZoom(level)
}

// Export methods for external use
defineExpose({
  goToId,
  goTo,
  goToStart,
  goToEnd,
  goToPrev,
  goToNext,
  zoomIn,
  zoomOut,
  setZoom,
  updateDisplay,
  focusContainer,
})
</script>

<template>
  <!-- .tl-timeline -->
  <div
    ref="timelineContainer"
    class="tl-timeline font-sans w-full h-full text-base lh-normal overflow-hidden relative  min-h-600px border border-gray-300 shadow-md relative"
  >
    <!-- .tl-storyslider -->
    <StorySlider
      v-if="processedData"
      ref="storySliderComponent"
      @loaded="onStorySliderLoaded"
      @change="onSlideChange"
      @colorchange="onColorChange"
      @nav_next="onStorySliderNext"
      @nav_previous="onStorySliderPrevious"
    />
    <TimeNav
      v-if="loaded"
      ref="timeNavComponent"
      class="tl-timenav"
      @loaded="onTimeNavLoaded"
      @change="onTimeNavChange"
      @zoomtoggle="onZoomToggle"
      @visible_ticks_change="onVisibleTicksChange"
    />

    <MenuBar
      v-if="loaded"
      ref="menuBarComponent"
      :options="timelineStore.options"
      :language="timelineStore.language"
      class="tl-menubar"
      @zoom_in="onZoomIn"
      @zoom_out="onZoomOut"
      @forward_to_end="onForwardToEnd"
      @back_to_start="onBackToStart"
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

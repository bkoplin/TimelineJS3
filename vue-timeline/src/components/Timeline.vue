<script lang="ts" setup>
import type {
  Language,
  TimelineChangeEvent,
  TimelineData,
  TimelineEvent,
  TimelineNavEvent,
  TimelineOptions,
  TimelineZoomEvent,
} from '../types'
import {
  breakpointsTailwind,
  useBreakpoints,
  useBrowserLocation,
  useElementSize,
  useEventListener,
  useResizeObserver,
  useScreenOrientation,
  useSupported,
} from '@vueuse/core'
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import { easeInOutQuint, easeOutStrong } from '../core/animation/Ease.ts'
import { english } from '../core/language/Language.ts'
import { TimelineConfig } from '../core/TimelineConfig.ts'
import { hexToRgb, mergeData } from '../core/Util.ts'
import '../style/base/variables.css'
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
  (e: 'nav_next', payload: any): void
  (e: 'nav_previous', payload: any): void
  (e: 'zoom_in', payload: TimelineZoomEvent): void
  (e: 'zoom_out', payload: TimelineZoomEvent): void
  (e: 'back_to_start', payload: TimelineNavEvent): void
  (e: 'forward_to_end', payload: TimelineNavEvent): void
}>()

// Setup reactive refs with Vue Macros
const timelineContainer = ref<HTMLElement | null>(null)
const { width, height } = useElementSize(timelineContainer)

const timeNavComponent = shallowRef<InstanceType<GlobalComponents['TimeNav']> | null>(null)
const storySliderComponent = shallowRef<InstanceType<GlobalComponents['StorySlider']> | null>(null)
const menuBarComponent = shallowRef<InstanceType<GlobalComponents['MenuBar']> | null>(null)

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

// Language
const i18n = ref<Language>(english)

// Computed property to transform processed data for StorySlider
const processedData = computed(() => {
  if (!config.value)
    return null

  return {
    title: config.value.title || undefined,
    events: config.value.events,
    eras: config.value.eras,
    scale: config.value.scale,
  }
})

// Default configuration options
const defaultOptions: TimelineOptions = {
  height: null,
  width: null,
  debug: false,
  font: 'default',
  is_embed: false,
  is_full_embed: false,
  hash_bookmark: false,
  default_bg_color: { r: 255, g: 255, b: 255 },
  scale_factor: 2,
  layout: 'landscape',
  timenav_position: 'bottom',
  optimal_tick_width: 60,
  base_class: 'tl-timeline',
  timenav_height: null,
  timenav_height_percentage: 25,
  timenav_mobile_height_percentage: 40,
  timenav_height_min: 175,
  marker_height_min: 30,
  marker_width_min: 100,
  marker_padding: 5,
  start_at_slide: 0,
  start_at_end: false,
  menubar_height: 0,
  skinny_size: 650,
  medium_size: 800,
  use_bc: false,
  duration: 1000,
  ease: easeInOutQuint,
  dragging: true,
  trackResize: true,
  map_type: 'stamen:toner-lite',
  slide_padding_lr: 100,
  slide_default_fade: '0%',
  zoom_sequence: [0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
  track_events: ['back_to_start', 'nav_next', 'nav_previous', 'zoom_in', 'zoom_out'],
  theme: null,
}

const options = ref<TimelineOptions>(mergeData({}, defaultOptions))

// Process options and data when they change
watch(() => props.options, (newOptions) => {
  if (newOptions) {
    processOptions(newOptions)
  }
}, { deep: true, immediate: true })

watch(() => props.data, (newData) => {
  if (newData) {
    initData(newData)
  }
}, { deep: true, immediate: true })

// Watch for hash changes
watch(hash, (newHash) => {
  if (options.value.hash_bookmark && newHash && newHash.indexOf('#event-') === 0) {
    goToId(newHash.replace('#event-', ''))
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

  // Merge options
  options.value = mergeData(options.value, newOptions)

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
    if (options.value.start_at_end || (options.value.start_at_slide && config.value && options.value.start_at_slide > config.value.events.length)) {
      goToEnd()
    }
    else if (options.value.start_at_slide) {
      goTo(options.value.start_at_slide)
    }

    // Handle hash bookmark
    if (options.value.hash_bookmark && hash.value) {
      const eventId = hash.value.replace('#event-', '')
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

function onColorChange(e: any): void {
  emit('colorchange', { unique_id: currentId.value as string })
}

function onSlideChange(e: { unique_id: string }): void {
  if (currentId.value !== e.unique_id) {
    currentId.value = e.unique_id
    timeNavComponent.value?.goToId(currentId.value)
    onChange(e)
  }
}

function onTimeNavChange(e: { unique_id: string }): void {
  if (currentId.value !== e.unique_id) {
    currentId.value = e.unique_id
    storySliderComponent.value?.goToId(currentId.value)
    onChange(e)
  }
}

function onChange(e: any): void {
  emit('changed', { unique_id: currentId.value as string })
  if (options.value.hash_bookmark && currentId.value) {
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

function onForwardToEnd(e: any): void {
  goToEnd()
  emit('forward_to_end', { unique_id: currentId.value as string })
}

function onBackToStart(e: any): void {
  goToStart()
  emit('back_to_start', { unique_id: currentId.value as string })
}

function onZoomIn(e: any): void {
  timeNavComponent.value?.zoomIn()
  emit('zoom_in', { zoom_level: options.value.scale_factor || 1 })
}

function onZoomOut(e: any): void {
  timeNavComponent.value?.zoomOut()
  emit('zoom_out', { zoom_level: options.value.scale_factor || 1 })
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
  emit('nav_next', e)
}

function onStorySliderPrevious(e: any): void {
  emit('nav_previous', e)
}

function checkLoaded(): void {
  if (_loaded.value.storyslider && _loaded.value.timenav) {
    emit('loaded', config.value)
  }
}

function updateDisplay(animate = false, d?: number): void {
  const duration = d || options.value.duration || 1000

  // Update width and height
  options.value.width = width.value
  options.value.height = height.value

  // Check if skinny
  let display_class = options.value.base_class || 'tl-timeline'
  if (width.value <= (options.value.skinny_size || 650)) {
    display_class += ' tl-skinny'
    options.value.layout = 'portrait'
  }
  else if (width.value <= (options.value.medium_size || 800)) {
    display_class += ' tl-medium'
    options.value.layout = 'landscape'
  }
  else {
    options.value.layout = 'landscape'
  }

  // Detect Mobile and Update Orientation
  const isTouch = useSupported(() => 'ontouchstart' in window)
  const { orientation } = useScreenOrientation()
  if (isTouch.value) {
    // Map screen orientation to timeline layout
    if (orientation.value?.includes('portrait')) {
      options.value.layout = 'portrait'
    }
    else if (orientation.value?.includes('landscape')) {
      options.value.layout = 'landscape'
    }
  }

  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = breakpoints.smaller('sm')

  if (isMobile.value) {
    display_class += ' tl-mobile'
    // Set TimeNav Height
    options.value.timenav_height = calculateTimeNavHeight(
      options.value.timenav_height,
      options.value.timenav_mobile_height_percentage,
    )
  }
  else {
    // Set TimeNav Height
    options.value.timenav_height = calculateTimeNavHeight(options.value.timenav_height)
  }

  // LAYOUT
  if (options.value.layout === 'portrait') {
    // Portrait
    display_class += ' tl-layout-portrait'
  }
  else {
    // Landscape
    display_class += ' tl-layout-landscape'
  }

  // Set StorySlider Height
  options.value.storyslider_height = (options.value.height as number - (options.value.timenav_height as number))

  if (i18n.value.direction === 'rtl') {
    display_class += ' tl-rtl'
  }

  // Update component displays
  timeNavComponent.value?.updateDisplay(width.value, options.value.timenav_height as number, animate)
  storySliderComponent.value?.updateDisplay(
    width.value,
    options.value.storyslider_height as number,
    animate,
    options.value.layout as string,
  )

  // Apply class
  if (timelineContainer.value) {
    timelineContainer.value.className = `vue-timeline ${display_class}`
  }
}

function calculateTimeNavHeight(timenav_height?: number | null, timenav_height_percentage?: number): number {
  let height = 0

  if (timenav_height) {
    height = timenav_height
  }
  else {
    if (options.value.timenav_height_percentage || timenav_height_percentage) {
      if (timenav_height_percentage) {
        height = Math.round(((options.value.height as number) / 100) * timenav_height_percentage)
      }
      else {
        height = Math.round(((options.value.height as number) / 100) * (options.value.timenav_height_percentage as number))
      }
    }
  }

  // Set new minimum based on how many rows needed
  if (timeNavComponent.value && timeNavComponent.value.ready) {
    const minHeight = timeNavComponent.value.getMinimumHeight()
    if ((options.value.timenav_height_min as number) < minHeight) {
      options.value.timenav_height_min = minHeight
    }
  }

  // If height is less than minimum set it to minimum
  if (height < (options.value.timenav_height_min as number)) {
    height = options.value.timenav_height_min as number
  }

  height = height - ((options.value.marker_padding as number) * 2)

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

function getEventIndex(id: string): number {
  if (config.value) {
    for (let i = 0; i < config.value.events.length; i++) {
      if (id === config.value.events[i].unique_id) {
        return i
      }
    }
  }
  return -1
}

function updateHashBookmark(id: string | null): void {
  if (id) {
    const hash = `#event-${id.toString()}`
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
  catch (e) {

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
  <div
    ref="timelineContainer"
    class="tl-timeline"
    tabindex="0"
    role="region"
    :aria-label="i18n.aria_label_timeline"
  >
    <TimeNav
      v-if="loaded && config"
      ref="timeNavComponent"
      :data="config as any"
      :options="options"
      :language="i18n"
      class="tl-timenav"
      @loaded="onTimeNavLoaded"
      @change="onTimeNavChange"
      @zoomtoggle="onZoomToggle"
      @visible_ticks_change="onVisibleTicksChange"
    />

    <StorySlider
      v-if="loaded && processedData"
      ref="storySliderComponent"
      :data="processedData"
      :options="options"
      :language="i18n"
      class="tl-storyslider"
      @loaded="onStorySliderLoaded"
      @change="onSlideChange"
      @colorchange="onColorChange"
      @nav_next="onStorySliderNext"
      @nav_previous="onStorySliderPrevious"
    />

    <MenuBar
      v-if="loaded"
      ref="menuBarComponent"
      :options="options"
      :language="i18n"
      class="tl-menubar"
      @zoom_in="onZoomIn"
      @zoom_out="onZoomOut"
      @forward_to_end="onForwardToEnd"
      @back_to_start="onBackToStart"
    />

    <div class="tl-attribution">
      <a
        href="https://timeline.knightlab.com"
        target="_blank"
        rel="noopener"
      >
        <span class="tl-knightlab-logo" />TimelineJS
      </a>
    </div>

    <div
      v-if="!loaded"
      class="tl-message-full"
    >
      {{ message }}
    </div>
  </div>
</template>

<style>
/* @import '../style/index.css'; */
</style>

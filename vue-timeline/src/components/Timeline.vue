<template>
  <div 
    ref="timelineContainer" 
    class="vue-timeline tl-container" 
    tabindex="0" 
    role="region" 
    :aria-label="i18n.aria_label_timeline"
  >
    <TimeNavComponent 
      v-if="loaded" 
      ref="timeNavComponent"
      :data="config" 
      :options="options" 
      :language="i18n"
      @loaded="onTimeNavLoaded"
      @change="onTimeNavChange"
      @zoomtoggle="onZoomToggle"
      @visible_ticks_change="onVisibleTicksChange"
      class="tl-timenav"
    />
    
    <StorySliderComponent 
      v-if="loaded" 
      ref="storySliderComponent"
      :data="config" 
      :options="options" 
      :language="i18n"
      @loaded="onStorySliderLoaded"
      @change="onSlideChange"
      @colorchange="onColorChange"
      @nav_next="onStorySliderNext"
      @nav_previous="onStorySliderPrevious"
      class="tl-storyslider"
    />
    
    <MenuBarComponent 
      v-if="loaded" 
      ref="menuBarComponent"
      :options="options" 
      :language="i18n"
      @zoom_in="onZoomIn"
      @zoom_out="onZoomOut"
      @forward_to_end="onForwardToEnd"
      @back_to_start="onBackToStart"
      class="tl-menubar"
    />
    
    <div class="tl-attribution">
      <a href="https://timeline.knightlab.com" target="_blank" rel="noopener">
        <span class="tl-knightlab-logo"></span>TimelineJS
      </a>
    </div>
    
    <div v-if="!loaded" class="tl-message-full">{{ message }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, shallowRef, watch, nextTick, onMounted } from 'vue'
import { 
  useElementSize, 
  useEventListener, 
  useResizeObserver,
  useBrowserLocation
} from '@vueuse/core'
import { TimelineConfig } from '../core/TimelineConfig'
import { hexToRgb, mergeData } from '../core/Util'
import { easeInOutQuint, easeOutStrong } from '../core/animation/Ease'
import { Animate } from '../core/animation/Animate'
import * as Browser from '../core/Browser'
import { english } from '../core/language/Language'
import TimeNavComponent from './TimeNav.vue'
import StorySliderComponent from './StorySlider.vue'
import MenuBarComponent from './MenuBar.vue'

// Define types for our component
interface TimelineEvent {
  unique_id: string
  start_date: any
  end_date?: any
  text: {
    headline: string
    text: string
  }
  media?: {
    url: string
    caption?: string
    credit?: string
  }
  [key: string]: any
}

interface TimelineData {
  title?: {
    unique_id?: string
    text: {
      headline: string
      text: string
    }
    [key: string]: any
  }
  events: TimelineEvent[]
  [key: string]: any
}

interface TimelineOptions {
  height?: number | null
  width?: number | null
  debug?: boolean
  font?: string
  is_embed?: boolean
  is_full_embed?: boolean
  hash_bookmark?: boolean
  default_bg_color?: { r: number, g: number, b: number } | string
  scale_factor?: number
  layout?: 'landscape' | 'portrait'
  timenav_position?: 'top' | 'bottom'
  optimal_tick_width?: number
  base_class?: string
  timenav_height?: number | null
  timenav_height_percentage?: number
  timenav_mobile_height_percentage?: number
  timenav_height_min?: number
  marker_height_min?: number
  marker_width_min?: number
  marker_padding?: number
  start_at_slide?: number
  start_at_end?: boolean
  menubar_height?: number
  skinny_size?: number
  medium_size?: number
  use_bc?: boolean
  duration?: number
  ease?: Function
  dragging?: boolean
  trackResize?: boolean
  map_type?: string
  slide_padding_lr?: number
  slide_default_fade?: string
  zoom_sequence?: number[]
  track_events?: string[]
  theme?: string | null
  initial_zoom?: number
  [key: string]: any
}

// Define props with TypeScript
const props = defineProps<{
  data: TimelineData
  options?: TimelineOptions
}>()

// Define emits with TypeScript
const emit = defineEmits<{
  (e: 'ready'): void
  (e: 'loaded', payload: any): void
  (e: 'changed', payload: { unique_id: string }): void
  (e: 'colorchange', payload: { unique_id: string }): void
  (e: 'nav_next', payload: any): void
  (e: 'nav_previous', payload: any): void
  (e: 'zoom_in', payload: { zoom_level: number }): void
  (e: 'zoom_out', payload: { zoom_level: number }): void
  (e: 'back_to_start', payload: { unique_id: string }): void
  (e: 'forward_to_end', payload: { unique_id: string }): void
}>()

// Setup reactive refs with Vue Macros
const timelineContainer = ref<HTMLElement | null>(null)
const { width, height } = useElementSize(timelineContainer)

const timeNavComponent = shallowRef<InstanceType<typeof TimeNavComponent> | null>(null)
const storySliderComponent = shallowRef<InstanceType<typeof StorySliderComponent> | null>(null)
const menuBarComponent = shallowRef<InstanceType<typeof MenuBarComponent> | null>(null)

// Use Vue macros reactivity transform for cleaner code
const loaded = $ref(false)
const message = $ref<string>('Loading timeline...')
const config = $ref<TimelineConfig | null>(null)
const currentId = $ref<string | null>(null)
const ready = $ref(false)
const _loaded = $ref({ timenav: false, storyslider: false })

// Browser location for handling hash changes
const { hash } = useBrowserLocation()

// Language
const i18n = $ref(english)

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
  layout: "landscape",
  timenav_position: "bottom",
  optimal_tick_width: 60,
  base_class: "tl-timeline",
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
  map_type: "stamen:toner-lite",
  slide_padding_lr: 100,
  slide_default_fade: "0%",
  zoom_sequence: [0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
  track_events: ['back_to_start', 'nav_next', 'nav_previous', 'zoom_in', 'zoom_out'],
  theme: null
}

const options = $ref<TimelineOptions>(mergeData({}, defaultOptions))

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
watch(() => hash.value, (newHash) => {
  if (options.hash_bookmark && newHash && newHash.indexOf('#event-') === 0) {
    goToId(newHash.replace("#event-", ""))
  }
})

// Watch for container size changes
useResizeObserver(timelineContainer, () => {
  if (ready) {
    updateDisplay()
  }
})

function processOptions(newOptions: TimelineOptions): void {
  // Process background color
  if (typeof newOptions.default_bg_color === 'string') {
    const parsed = hexToRgb(newOptions.default_bg_color)
    if (parsed) {
      newOptions.default_bg_color = parsed
    } else {
      delete newOptions.default_bg_color
      console.warn('Invalid default background color. Ignoring.')
    }
  }
  
  // Merge options
  mergeData(options, newOptions)
  
  if (ready) {
    updateDisplay()
  }
}

function initData(data: TimelineData): void {
  if (data) {
    try {
      config = new TimelineConfig(data)
      if (config.isValid()) {
        config.validate()
        if (config.isValid()) {
          onDataLoaded()
        } else {
          const errs = config.getErrors()
          message = `Error: ${errs.map(e => e.message_key).join(', ')}`
        }
      } else {
        message = 'Invalid timeline configuration'
      }
    } catch (e: any) {
      message = `Error initializing timeline: ${e.message || e}`
    }
  }
}

function onDataLoaded(): void {
  emit('dataloaded')
  nextTick(() => {
    // Hide message
    message = ''
    loaded = true
    
    // Set ready state
    ready = true
    emit('ready')
    
    // Check if we should start at end or at a specific slide
    if (options.start_at_end || (options.start_at_slide && config && options.start_at_slide > config.events.length)) {
      goToEnd()
    } else if (options.start_at_slide) {
      goTo(options.start_at_slide)
    }
    
    // Handle hash bookmark
    if (options.hash_bookmark && hash.value) {
      const eventId = hash.value.replace("#event-", "")
      if (eventId) {
        goToId(eventId)
      } else {
        updateHashBookmark(currentId)
      }
    }
  })
}

function onKeydown(event: KeyboardEvent): void {
  if (config) {
    const keyName = event.key
    const currentSlide = getSlideIndex(currentId as string)
    const _n = config.events.length - 1
    const lastSlide = config.title ? _n + 1 : _n
    const firstSlide = 0

    if (keyName === 'ArrowLeft') {
      if (currentSlide !== firstSlide) {
        goToPrev()
      }
    } else if (keyName === 'ArrowRight') {
      if (currentSlide !== lastSlide) {
        goToNext()
      }
    }
  }
}

// Set up keyboard event listener
useEventListener(document, 'keydown', onKeydown)

function onColorChange(e: any): void {
  emit('colorchange', { unique_id: currentId as string })
}

function onSlideChange(e: { unique_id: string }): void {
  if (currentId !== e.unique_id) {
    currentId = e.unique_id
    timeNavComponent.value?.goToId(currentId)
    onChange(e)
  }
}

function onTimeNavChange(e: { unique_id: string }): void {
  if (currentId !== e.unique_id) {
    currentId = e.unique_id
    storySliderComponent.value?.goToId(currentId)
    onChange(e)
  }
}

function onChange(e: any): void {
  emit('changed', { unique_id: currentId as string })
  if (options.hash_bookmark && currentId) {
    updateHashBookmark(currentId)
  }
}

function onZoomToggle(e: { zoom: string, show: boolean }): void {
  if (e.zoom === "in") {
    menuBarComponent.value?.toogleZoomIn(e.show)
  } else if (e.zoom === "out") {
    menuBarComponent.value?.toogleZoomOut(e.show)
  }
}

function onVisibleTicksChange(e: { visible_ticks: any }): void {
  menuBarComponent.value?.changeVisibleTicks(e.visible_ticks)
}

function onForwardToEnd(e: any): void {
  goToEnd()
  emit('forward_to_end', { unique_id: currentId as string })
}

function onBackToStart(e: any): void {
  goToStart()
  emit('back_to_start', { unique_id: currentId as string })
}

function onZoomIn(e: any): void {
  timeNavComponent.value?.zoomIn()
  emit('zoom_in', { zoom_level: options.scale_factor || 1 })
}

function onZoomOut(e: any): void {
  timeNavComponent.value?.zoomOut()
  emit('zoom_out', { zoom_level: options.scale_factor || 1 })
}

function onTimeNavLoaded(): void {
  _loaded.timenav = true
  checkLoaded()
}

function onStorySliderLoaded(): void {
  _loaded.storyslider = true
  checkLoaded()
}

function onStorySliderNext(e: any): void {
  emit('nav_next', e)
}

function onStorySliderPrevious(e: any): void {
  emit('nav_previous', e)
}

function checkLoaded(): void {
  if (_loaded.storyslider && _loaded.timenav) {
    emit('loaded', config)
  }
}

function updateDisplay(animate = false, d?: number): void {
  const duration = d || options.duration || 1000
  
  // Update width and height
  options.width = width.value
  options.height = height.value

  // Check if skinny
  let display_class = options.base_class || 'tl-timeline'
  if (width.value <= (options.skinny_size || 650)) {
    display_class += " tl-skinny"
    options.layout = "portrait"
  } else if (width.value <= (options.medium_size || 800)) {
    display_class += " tl-medium"
    options.layout = "landscape"
  } else {
    options.layout = "landscape"
  }

  // Detect Mobile and Update Orientation
  if (Browser.touch) {
    options.layout = Browser.orientation()
  }

  if (Browser.isMobile) {
    display_class += " tl-mobile"
    // Set TimeNav Height
    options.timenav_height = calculateTimeNavHeight(
      options.timenav_height, 
      options.timenav_mobile_height_percentage
    )
  } else {
    // Set TimeNav Height
    options.timenav_height = calculateTimeNavHeight(options.timenav_height)
  }

  // LAYOUT
  if (options.layout === "portrait") {
    // Portrait
    display_class += " tl-layout-portrait"
  } else {
    // Landscape
    display_class += " tl-layout-landscape"
  }

  // Set StorySlider Height
  options.storyslider_height = (options.height as number - (options.timenav_height as number))

  if (i18n.direction === 'rtl') {
    display_class += ' tl-rtl'
  }

  // Update component displays
  timeNavComponent.value?.updateDisplay(width.value, options.timenav_height as number, animate)
  storySliderComponent.value?.updateDisplay(
    width.value, 
    options.storyslider_height as number, 
    animate, 
    options.layout as string
  )

  // Apply class
  if (timelineContainer.value) {
    timelineContainer.value.className = `vue-timeline ${display_class}`
  }
}

function calculateTimeNavHeight(timenav_height?: number, timenav_height_percentage?: number): number {
  let height = 0

  if (timenav_height) {
    height = timenav_height
  } else {
    if (options.timenav_height_percentage || timenav_height_percentage) {
      if (timenav_height_percentage) {
        height = Math.round(((options.height as number) / 100) * timenav_height_percentage)
      } else {
        height = Math.round(((options.height as number) / 100) * (options.timenav_height_percentage as number))
      }
    }
  }

  // Set new minimum based on how many rows needed
  if (timeNavComponent.value && timeNavComponent.value.ready) {
    const minHeight = timeNavComponent.value.getMinimumHeight()
    if ((options.timenav_height_min as number) < minHeight) {
      options.timenav_height_min = minHeight
    }
  }

  // If height is less than minimum set it to minimum
  if (height < (options.timenav_height_min as number)) {
    height = options.timenav_height_min as number
  }

  height = height - ((options.marker_padding as number) * 2)

  return height
}

function getSlideIndex(id: string): number {
  if (config) {
    if (config.title && config.title.unique_id === id) {
      return 0
    }
    for (let i = 0; i < config.events.length; i++) {
      if (id === config.events[i].unique_id) {
        return config.title ? i + 1 : i
      }
    }
  }
  return -1
}

function getEventIndex(id: string): number {
  if (config) {
    for (let i = 0; i < config.events.length; i++) {
      if (id === config.events[i].unique_id) {
        return i
      }
    }
  }
  return -1
}

function updateHashBookmark(id: string | null): void {
  if (id) {
    const hash = "#event-" + id.toString()
    window.history.replaceState(null, "Browsing TimelineJS", hash)
  }
}

// Public API methods
function goToId(id: string): void {
  if (currentId !== id) {
    currentId = id
    timeNavComponent.value?.goToId(currentId)
    storySliderComponent.value?.goToId(currentId, false, true)
    emit('changed', { unique_id: currentId })
  }
}

function goTo(n: number): void {
  if (n < 0 || !config) {
    return
  }

  try {
    if (config.title) {
      if (n === 0) {
        goToId(config.title.unique_id as string)
      } else {
        goToId(config.events[n - 1].unique_id)
      }
    } else {
      goToId(config.events[n].unique_id)
    }
  } catch (e) {
    return
  }
}

function goToStart(): void {
  goTo(0)
}

function goToEnd(): void {
  if (config) {
    const _n = config.events.length - 1
    goTo(config.title ? _n + 1 : _n)
  }
}

function goToPrev(): void {
  if (currentId) {
    goTo(getSlideIndex(currentId) - 1)
    focusContainer()
  }
}

function goToNext(): void {
  if (currentId) {
    goTo(getSlideIndex(currentId) + 1)
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
  focusContainer
})
</script>

<style>
.tl-timeline {
  width: 100%;
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.3;
  position: relative;
  background-color: rgb(var(--timeline-bg, 255 255 255));
  color: rgb(var(--timeline-text, 51 51 51));
  overflow: hidden;
}

.tl-storyslider {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.tl-timenav {
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: rgb(var(--timeline-line, 204 204 204));
}

.tl-menubar {
  position: absolute;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tl-attribution {
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 10px;
  color: #999;
  z-index: 10;
}

.tl-message-full {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 10px;
}

.tl-rtl {
  direction: rtl;
}

.tl-layout-portrait .tl-storyslider {
  height: 45%;
}

.tl-layout-portrait .tl-timenav {
  height: 55%;
}

.tl-skinny .tl-storyslider {
  height: 55%;
}

.tl-skinny .tl-timenav {
  height: 45%;
}

.tl-medium .tl-storyslider {
  height: 60%;
}

.tl-medium .tl-timenav {
  height: 40%;
}

.tl-mobile .tl-storyslider {
  height: 55%;
}

.tl-mobile .tl-timenav {
  height: 45%;
}

.tl-knightlab-logo {
  display: inline-block;
  vertical-align: middle;
  height: 12px;
  width: 12px;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNMTMuNTQgMi4xM0wxNCAxLjY3IDEzLjU0IDEuMjFDMTIuNTggLjI1IDExLjMzIDAgMTAgMGMtMS4zMyAwLTIuNTguMjUtMy41NCAxLjIxTDYgMS42N2wuNDYuNDZDNy40MiAzLjA4IDggMy44MyA4IDVWN2gyVjVjMC0xLjE3LjU4LTEuOTIgMS41NC0yLjg3eiIvPjxwYXRoIGQ9Ik04IDZINnY0YzAgMS4xNy0uNTggMS45Mi0xLjU0IDIuODdsLS40Ni40Ni40Ni40NkM1LjQyIDE0Ljc1IDYuNjcgMTUgOCAxNWMxLjMzIDAgMi41OC0uMjUgMy41NC0xLjIxbC40Ni0uNDYtLjQ2LS40NkMxMC41OCAxMS45MiAxMCAxMS4xNyAxMCAxMFY2SDh6Ii8+PC9zdmc+");
  background-repeat: no-repeat;
  background-position: center;
  margin-right: 3px;
  opacity: 0.5;
}

.tl-attribution a {
  color: #999;
  text-decoration: none;
}

.tl-attribution a:hover {
  color: #333;
  text-decoration: underline;
}
</style>

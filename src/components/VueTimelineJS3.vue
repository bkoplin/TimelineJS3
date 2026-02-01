<template>
  <div 
    ref="timelineContainer"
    class="vue-timeline-js3"
    :class="containerClasses"
    :style="containerStyles"
  >
    <TimelineMenuBar
      v-if="options.menubar_height !== 0"
      @zoom-in="handleZoomIn"
      @zoom-out="handleZoomOut"
      @go-to-start="handleGoToStart"
      @go-to-end="handleGoToEnd"
    />
    
    <div class="timeline-main">
      <TimelineSlider
        v-if="isReady"
        :events="mappedEvents"
        :title="data.title"
        :current-index="currentSlideIndex"
        :options="options"
        @change="handleSlideChange"
        @media-loaded="handleMediaLoaded"
      />
      
      <TimelineNav
        v-if="isReady && options.timenav_position"
        :events="mappedEvents"
        :eras="data.eras"
        :current-index="currentSlideIndex"
        :options="options"
        :position="options.timenav_position"
        @marker-click="handleMarkerClick"
        @zoom-in="handleZoomIn"
        @zoom-out="handleZoomOut"
      />
    </div>
    
    <TimelineMessage v-if="isLoading" message="Loading..." />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, provide, ref } from 'vue'
import TimelineMenuBar from './TimelineMenuBar.vue'
import TimelineSlider from './TimelineSlider.vue'
import TimelineNav from './TimelineNav.vue'
import TimelineMessage from './TimelineMessage.vue'
import { useTimelineState } from '@/composables/useTimelineState'
import { usePropertyMapping } from '@/composables/usePropertyMapping'
import { useTimelinePositioning } from '@/composables/useTimelinePositioning'
import { useKeyboardNavigation } from '@/composables/useKeyboardNavigation'
import { useTouchNavigation } from '@/composables/useTouchNavigation'
import { useIconProvider, type IconDefinitions } from '@/composables/useIconProvider'
import type { 
  TimelineData, 
  TimelineOptions, 
  TimelineEvent,
  TimelineTitle,
  TimelineEra,
  TimelinePropertyMapping
} from '@/types/timeline'

interface Props {
  data: TimelineData
  options?: Partial<TimelineOptions>
  propertyMapping?: TimelinePropertyMapping
}

const props = withDefaults(defineProps<Props>(), {
  options: () => ({}),
  propertyMapping: undefined
})

const emit = defineEmits<{
  (e: 'change', data: { unique_id: string; slide_index: number }): void
  (e: 'nav_next'): void
  (e: 'nav_previous'): void
  (e: 'back_to_start'): void
  (e: 'forward_to_end'): void
  (e: 'zoom_in', data: { zoom_level: number }): void
  (e: 'zoom_out', data: { zoom_level: number }): void
  (e: 'ready'): void
  (e: 'dataloaded'): void
  (e: 'loaded', data: { scale: string; eras: readonly TimelineEra[]; events: readonly TimelineEvent[]; title?: TimelineTitle }): void
  (e: 'hash_updated', data: { unique_id: string; hashbookmark: string }): void
  (e: 'color_change', data: { unique_id: string }): void
  (e: 'background_change', data: { unique_id: string }): void
  (e: 'added', data: { unique_id: string }): void
  (e: 'removed', data: { unique_id: string }): void
  (e: 'media_loaded', data: { unique_id: string }): void
  (e: 'markerclick', data: { unique_id: string }): void
  (e: 'markerblur', data: { unique_id: string }): void
  (e: 'swipe_left'): void
  (e: 'swipe_right'): void
  (e: 'swipe_up'): void
  (e: 'swipe_down'): void
  (e: 'keyboard_navigation', data: { key: string; action: string }): void
}>()

// Default options
const defaultOptions: TimelineOptions = {
  width: '100%',
  height: 600,
  hash_bookmark: false,
  default_bg_color: '#ffffff',
  scale_factor: 2,
  timenav_position: 'bottom',
  optimal_tick_width: 100,
  timenav_height: 150,
  timenav_height_percentage: 25,
  start_at_slide: 0,
  start_at_end: false,
  menubar_height: 0,
  use_bc: false,
  duration: 1000,
  ease: 'easeInOutQuint',
  dragging: true,
  trackResize: true,
  slide_padding_lr: 100,
  slide_default_fade: '0%',
  icon_pack: 'fontawesome',
  keyboard_navigation_enabled: true,
  touch_navigation_enabled: true
}

const mergedOptions = computed(() => ({
  ...defaultOptions,
  ...props.options
}))

// Container ref for touch navigation
const timelineContainer = ref<HTMLElement | null>(null)

// Use composables
const state = useTimelineState(props.data, mergedOptions.value)
const { mapEvents } = usePropertyMapping(props.propertyMapping)

// Icon provider - Initialize with custom icons from options
const iconProvider = useIconProvider(mergedOptions.value.icons as Partial<IconDefinitions> || {})

// Provide icon provider to all child components
provide('iconProvider', iconProvider)

// Computed properties
const { 
  data, 
  events, 
  title, 
  eras, 
  currentSlideIndex, 
  isReady, 
  isLoading,
  setCurrentSlide,
  setReady,
  setLoading
} = state

// Map events if property mapping is provided
const mappedEvents = computed(() => {
  return events.value.length > 0 ? mapEvents(events.value as any) : events.value
})

// Use positioning composable with scale config from options
const positioning = useTimelinePositioning(
  mappedEvents,
  mergedOptions,
  {
    scaleConfig: mergedOptions.value.scale_config,
    tickCount: mergedOptions.value.axis_tick_count
  }
)

// Keyboard navigation
const keyboardNav = useKeyboardNavigation(
  {
    enabled: mergedOptions.value.keyboard_navigation_enabled,
    onNext: () => {
      goToNext()
      emit('keyboard_navigation', { key: 'next', action: 'nav_next' })
    },
    onPrevious: () => {
      goToPrev()
      emit('keyboard_navigation', { key: 'previous', action: 'nav_previous' })
    },
    onFirst: () => {
      goToStart()
      emit('keyboard_navigation', { key: 'first', action: 'back_to_start' })
    },
    onLast: () => {
      goToEnd()
      emit('keyboard_navigation', { key: 'last', action: 'forward_to_end' })
    },
    onZoomIn: () => {
      handleZoomIn()
      emit('keyboard_navigation', { key: 'zoomIn', action: 'zoom_in' })
    },
    onZoomOut: () => {
      handleZoomOut()
      emit('keyboard_navigation', { key: 'zoomOut', action: 'zoom_out' })
    }
  },
  mergedOptions.value.keyboard_navigation_keys
)

// Touch navigation (initialized after mount when container ref is available)
let touchNav: ReturnType<typeof useTouchNavigation> | null = null

// Provide state for child components
provide('timeline-state', state)
provide('timeline-options', mergedOptions)
provide('timeline-positioning', positioning)
provide('custom-icons', props.customIcons)

const containerClasses = computed(() => ({
  'tl-timeline': true,
  'tl-timeline-embed': true
}))

const containerStyles = computed(() => ({
  width: typeof mergedOptions.value.width === 'number' 
    ? `${mergedOptions.value.width}px` 
    : mergedOptions.value.width,
  height: typeof mergedOptions.value.height === 'number'
    ? `${mergedOptions.value.height}px`
    : mergedOptions.value.height
}))

// Event handlers
function handleSlideChange(index: number) {
  setCurrentSlide(index)
  const event = mappedEvents.value[index]
  emit('change', { 
    unique_id: event?.unique_id || `slide-${index}`, 
    slide_index: index 
  })
}

function handleMarkerClick(eventId: string) {
  const index = mappedEvents.value.findIndex(e => e.unique_id === eventId)
  if (index >= 0) {
    handleSlideChange(index)
    emit('markerclick', { unique_id: eventId })
  }
}

function handleZoomIn() {
  positioning.zoomIn()
  emit('zoom_in', { zoom_level: positioning.zoomLevel.value })
}

function handleZoomOut() {
  positioning.zoomOut()
  emit('zoom_out', { zoom_level: positioning.zoomLevel.value })
}

function handleGoToStart() {
  setCurrentSlide(0)
  emit('back_to_start')
}

function handleGoToEnd() {
  const lastIndex = state.getTotalSlides() - 1
  setCurrentSlide(lastIndex)
  emit('forward_to_end')
}

function handleMediaLoaded(eventId: string) {
  emit('media_loaded', { unique_id: eventId })
}

// Public API methods
function goTo(slideIndex: number) {
  handleSlideChange(slideIndex)
}

function goToId(id: string) {
  const index = mappedEvents.value.findIndex(e => e.unique_id === id)
  if (index >= 0) {
    handleSlideChange(index)
  }
}

function goToNext() {
  const nextIndex = currentSlideIndex.value + 1
  if (nextIndex < state.getTotalSlides()) {
    handleSlideChange(nextIndex)
    emit('nav_next')
  }
}

function goToPrev() {
  const prevIndex = currentSlideIndex.value - 1
  if (prevIndex >= 0) {
    handleSlideChange(prevIndex)
    emit('nav_previous')
  }
}

function goToStart() {
  handleGoToStart()
}

function goToEnd() {
  handleGoToEnd()
}

function getData(slideIndex: number) {
  return state.getEvent(slideIndex)
}

function getDataById(id: string) {
  return state.getEventById(id)
}

// Expose public API
defineExpose({
  goTo,
  goToId,
  goToNext,
  goToPrev,
  goToStart,
  goToEnd,
  getData,
  getDataById,
  // Navigation controls
  enableKeyboardNavigation: () => keyboardNav.enable(),
  disableKeyboardNavigation: () => keyboardNav.disable(),
  enableTouchNavigation: () => touchNav?.enable(),
  disableTouchNavigation: () => touchNav?.disable()
})

// Watch for data changes
watch(() => props.data, (newData) => {
  state.setData(newData)
  emit('dataloaded')
})

// Watch for keyboard navigation option changes
watch(() => mergedOptions.value.keyboard_navigation_enabled, (enabled) => {
  if (enabled) {
    keyboardNav.enable()
  } else {
    keyboardNav.disable()
  }
})

// Watch for touch navigation option changes
watch(() => mergedOptions.value.touch_navigation_enabled, (enabled) => {
  if (touchNav) {
    if (enabled) {
      touchNav.enable()
    } else {
      touchNav.disable()
    }
  }
})

// Initialize
onMounted(() => {
  setLoading(false)
  setReady(true)
  
  // Initialize touch navigation with container element
  if (timelineContainer.value && mergedOptions.value.touch_navigation_enabled) {
    touchNav = useTouchNavigation({
      enabled: mergedOptions.value.touch_navigation_enabled,
      element: timelineContainer.value,
      minSwipeDistance: mergedOptions.value.swipe_min_distance || 50,
      velocityThreshold: mergedOptions.value.swipe_velocity_threshold || 0.3,
      preventDefaultOnSwipe: mergedOptions.value.swipe_prevent_default !== false,
      onSwipeLeft: () => {
        goToNext()
        emit('swipe_left')
      },
      onSwipeRight: () => {
        goToPrev()
        emit('swipe_right')
      },
      onSwipeUp: () => {
        handleZoomIn()
        emit('swipe_up')
      },
      onSwipeDown: () => {
        handleZoomOut()
        emit('swipe_down')
      }
    })
    touchNav.attach()
  }
  
  emit('ready')
  emit('loaded', {
    scale: data.value.scale || 'human',
    eras: eras.value || [],
    events: events.value,
    title: title.value
  })
})
</script>

<style lang="scss">
.vue-timeline-js3 {
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  
  .timeline-main {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}
</style>

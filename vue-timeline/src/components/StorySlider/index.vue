<script lang="ts" setup>
import type { Language, ProcessedTimelineData, Slide as SlideType, TimelineChangeEvent, TimelineOptions } from '../../types'
import { useElementSize, useEventListener, useResizeObserver, useSwipe, useTemplateRefsList } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'

// Define props and emits
const props = defineProps<{
  data: ProcessedTimelineData
  options: TimelineOptions
  language: Language
}>()

const emit = defineEmits<{
  (e: 'loaded'): void
  (e: 'change', payload: TimelineChangeEvent): void
  (e: 'colorchange', payload: TimelineChangeEvent): void
  (e: 'navNext', payload: any): void
  (e: 'navPrevious', payload: any): void
}>()

// Setup reactive refs
const storySliderEl = ref<HTMLDivElement | null>(null)
const sliderBackgroundEl = ref<HTMLDivElement | null>(null)
const sliderContainerMaskEl = ref<HTMLDivElement | null>(null)
const sliderContainerEl = ref<HTMLDivElement | null>(null)
const sliderItemContainerEl = ref<HTMLDivElement | null>(null)

const { width, height } = useElementSize(storySliderEl)
const ready = ref(false)
const slides = ref<SlideType[]>([])
const currentIndex = ref<number>(0)

// Use templateRefsList for slide components
const slideRefs = useTemplateRefsList<GlobalComponents['StorySliderSlide']>()

// Computed properties for positioning (similar to original StorySlider)
const containerWidth = computed(() => width.value || props.options.width || 600)
const containerHeight = computed(() => height.value || props.options.height || 600)

// Slide spacing - similar to original: slide_spacing = this.options.width * 2
const slideSpacing = computed(() => containerWidth.value * 2)

// Computed properties for navigation
const previousSlide = computed(() => {
  if (currentIndex.value > 0) {
    return slides.value[currentIndex.value - 1]
  }
  return null
})

const nextSlide = computed(() => {
  if (currentIndex.value < slides.value.length - 1) {
    return slides.value[currentIndex.value + 1]
  }
  return null
})

const previousNavData = computed(() => {
  if (!previousSlide.value)
    return null

  return {
    title: previousSlide.value.data.text?.headline || '',
    date: previousSlide.value.data.start_date?.format('MMM D, YYYY') || '',
  }
})

const nextNavData = computed(() => {
  if (!nextSlide.value)
    return null

  return {
    title: nextSlide.value.data.text?.headline || '',
    date: nextSlide.value.data.start_date?.format('MMM D, YYYY') || '',
  }
})

// Computed classes for dynamic styling - removing unused ones
// const storySliderClasses = computed(() => ({
//   'tl-storyslider': true,
// }))

// const sliderContainerClasses = computed(() => ({
//   'tl-slider-container': true,
//   'tl-animate': true,
// }))

// Watch for resize to update layout
useResizeObserver(sliderItemContainerEl, () => {
  updateDisplay(containerWidth.value, containerHeight.value, false, props.options.layout || 'portrait')
})

// Add swipe support
const { direction } = useSwipe(sliderItemContainerEl, {
  onSwipeEnd() {
    if (direction.value === 'left') {
      next()
    }
    else if (direction.value === 'right') {
      previous()
    }
  },
})

// Initialize on mount
onMounted(() => {
  _initEvents()
  _createSlides()

  // Set initial slide based on options
  if (props.options.start_at_slide && props.options.start_at_slide > 0) {
    const startIndex = Math.min(props.options.start_at_slide - 1, slides.value.length - 1)
    goTo(startIndex, true)
  }
  else if (props.options.start_at_end) {
    goTo(slides.value.length - 1, true)
  }

  // Set ready state
  ready.value = true
  emit('loaded')
})

// Watch for data changes
watch(() => props.data, () => {
  if (ready.value) {
    _createSlides()
  }
}, { deep: true })

// Component methods
function _initEvents() {
  // Setup event listeners for navigation
  useEventListener(document, 'keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      previous()
    }
    else if (e.key === 'ArrowRight') {
      next()
    }
  })
}

function _createSlides() {
  const newSlides: SlideType[] = []

  // Process title slide if it exists
  if (props.data.title && props.data.title.unique_id) {
    newSlides.push({
      data: props.data.title,
      position: 0,
      id: props.data.title.unique_id,
    })
  }

  // Process event slides
  if (props.data.events) {
    props.data.events.forEach((event, i) => {
      if (event.unique_id) {
        newSlides.push({
          data: event,
          position: props.data.title ? i + 1 : i,
          id: event.unique_id,
        })
      }
    })
  }

  slides.value = newSlides
}

// Navigation methods similar to original
function goTo(n: number, fast = false): void {
  if (n < 0 || n >= slides.value.length)
    return

  currentIndex.value = n

  if (slides.value[n]) {
    const uniqueId = slides.value[n].id
    emit('change', { unique_id: uniqueId })

    // Preload adjacent slides (similar to original)
    setTimeout(() => {
      preloadSlides(n)
    }, fast ? 0 : 500)
  }
}

function goToId(id: string, fast = false): void {
  const index = slides.value.findIndex(slide => slide.id === id)
  if (index !== -1) {
    goTo(index, fast)
  }
}

function next(): void {
  const n = currentIndex.value
  if (n + 1 < slides.value.length) {
    goTo(n + 1)
    emit('navNext', { direction: 'next' })
  }
}

function previous(): void {
  const n = currentIndex.value
  if (n - 1 >= 0) {
    goTo(n - 1)
    emit('navPrevious', { direction: 'previous' })
  }
}

function handleNavClick(direction: 'previous' | 'next'): void {
  if (direction === 'previous') {
    previous()
  }
  else {
    next()
  }
}

function preloadSlides(n: number): void {
  // Preload adjacent slides for better performance
  // This is similar to the original preloadSlides method
  const slideComponents = slideRefs.value

  if (slideComponents[n + 1]) {
    // Preload next slide
  }
  if (slideComponents[n - 1]) {
    // Preload previous slide
  }
}

function updateDisplay(_w: number, _h: number, _animate: boolean, _layout: string): void {
  // Update container dimensions and trigger reactive updates
  // The computed properties will handle the rest
}

// Expose public methods
defineExpose({
  ready,
  goTo,
  goToId,
  next,
  previous,
  updateDisplay,
  slideRefs,
})
</script>

<template>
  <!-- .tl-storyslider -->
  <div
    ref="storySliderEl"
    class="tl-storyslider w-full h-full overflow-hidden relative z-8 select-none"
  >
    <!-- Background -->
    <div
      ref="sliderBackgroundEl"
      class="tl-slider-background absolute top-0 left-0 w-full h-full z-1 tl-animate"
    />

    <!-- Touch mask would go here for mobile -->

    <!-- Slider Container Mask -->
    <div
      ref="sliderContainerMaskEl"
      class="tl-slider-container-mask text-center w-full h-full relative z-5"
    >
      <!-- Slider Container -->
      <div
        ref="sliderContainerEl"
        class="tl-slider-container tl-animate absolute top-0 left-0 w-full h-full text-center tl-animate"
        :style="{ left: `${-currentIndex * slideSpacing}px` }"
      >
        <!-- Slider Item Container -->
        <div
          ref="sliderItemContainerEl"
          class="tl-slider-item-container w-full h-full table-cell v-middle"
        >
          <StorySliderSlide
            v-for="(slide, index) in slides"
            :ref="slideRefs.set"
            :key="slide.id"
            :slide="slide"
            :active="index === currentIndex"
            :style="{
              left: `${index * slideSpacing}px`,
              width: `${containerWidth}px`,
              height: `${containerHeight}px`,
            }"
          />
        </div>
      </div>
    </div>

    <!-- Navigation components -->
    <StorySliderSlideNav
      v-if="previousNavData"
      direction="previous"
      :title="previousNavData.title"
      :date="previousNavData.date"
      @clicked="handleNavClick"
    />

    <StorySliderSlideNav
      v-if="nextNavData"
      direction="next"
      :title="nextNavData.title"
      :date="nextNavData.date"
      @clicked="handleNavClick"
    />
  </div>
</template>

<style scoped>
/* StorySlider Styles - Based on TL.StorySlider.less */
.tl-storyslider {
    box-sizing: content-box;

    & img, & embed, & object, & video, & iframe {
      max-width: 100%;
      position: relative;
    }
  }

/* Animation classes */
.tl-animate {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.770, 0.000, 0.175, 1.000);
  transition-duration: 1000ms;
}

/* Responsive Design */
@media (max-width: 768px) {
  .tl-slidenav-previous,
  .tl-slidenav-next {
    display: none;
  }
}
</style>

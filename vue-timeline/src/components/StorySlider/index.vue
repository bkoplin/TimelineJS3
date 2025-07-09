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
  (e: 'change', payload: SlideType): void
  (e: 'colorchange', payload: SlideType): void
  (e: 'navNext', payload: { direction: 'next' }): void
  (e: 'navPrevious', payload: { direction: 'previous' }): void
}>()

// Setup reactive refs
const storySliderEl = ref<HTMLDivElement | null>(null)
const sliderBackgroundEl = ref<HTMLDivElement | null>(null)
const sliderContainerMaskEl = ref<HTMLDivElement | null>(null)
const sliderContainerEl = ref<HTMLDivElement | null>(null)
const sliderItemContainerEl = ref<HTMLDivElement | null>(null)

const { width, height } = useElementSize(storySliderEl)
const ready = ref(false)
const slides = computed<SlideType[]>(() => {
  const newSlides: SlideType[] = []
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
  return newSlides
})
const currentIndex = ref<number>(0)
const {
  isCurrent,
  previous: stepperPrevious,
  next: stepperNext,
  goTo: stepperGoTo,
  current: stepperCurrent,
  index: stepperIndex,
  goToNext,
  goToPrevious,
  goBackTo,
  stepNames,
  steps,
} = useStepper<SlideType>(slides)
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

useResizeObserver(sliderItemContainerEl, () => {
  updateDisplay(containerWidth.value, containerHeight.value, false, props.options.layout || 'portrait')
})

// Add swipe support
const { direction } = useSwipe(sliderItemContainerEl, {
  onSwipeEnd() {
    if (direction.value === 'left') {
      goToNext()
    }
    else if (direction.value === 'right') {
      goToPrevious()
    }
  },
})

// Initialize on mount
onMounted(() => {
  _initEvents()

  // Set initial slide based on options
  if (props.options.start_at_slide && props.options.start_at_slide > 0) {
    const startIndex = Math.min(props.options.start_at_slide - 1, slides.value.length - 1)
    stepperIndex.value = startIndex
  }
  else if (props.options.start_at_end) {
    stepperIndex.value = slides.value.length - 1
  }
  else {
    stepperIndex.value = 0
  }

  // Set ready state
  ready.value = true
  emit('loaded')
})

// Component methods
function _initEvents() {
  // Setup event listeners for navigation
  useEventListener(document, 'keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      emit('navPrevious', { direction: 'previous' })
      goToPrevious()
    }
    else if (e.key === 'ArrowRight') {
      emit('navNext', { direction: 'next' })
      goToNext()
    }
  })
}

watch(stepperIndex, (newIndex) => {
  goTo(newIndex)
})

// Navigation methods similar to original
function goTo(n: number): void {
  if (n < 0 || n >= slides.value.length)
    return

  if (slides.value[n]) {
    emit('change', slides.value[n])
  }
}

function goToId(id: string, fast = false): void {
  const index = slides.value.findIndex(slide => slide.id === id)
  if (index !== -1) {
    goTo(index)
  }
}

function handleNavClick(direction: 'previous' | 'next'): void {
  if (direction === 'previous') {
    emit('navPrevious', { direction: 'previous' })
    goToPrevious()
  }
  else {
    emit('navNext', { direction: 'next' })
    goToNext()
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
  next: goToNext,
  previous: goToPrevious,
  stepperIndex: currentIndex,
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
        :style="{ left: `${-stepperIndex * slideSpacing}px` }"
      >
        <!-- Slider Item Container -->
        <div
          ref="sliderItemContainerEl"
          class="tl-slider-item-container w-full h-full table-cell v-middle"
        >
          <template v-for="(slide, index) in slides">
            <StorySliderSlide
              v-if="index >= stepperIndex - 1 && index <= stepperIndex + 1"
              :ref="slideRefs.set"
              :key="slide.id"
              :slide="slide"
              :active="index === stepperIndex"
              :style="{
                left: `${index * slideSpacing}px`,
                width: `${containerWidth}px`,
                height: `${containerHeight}px`,
              }"
            />
          </template>
        </div>
      </div>
    </div>

    <!-- Navigation components -->
    <StorySliderSlideNav
      v-if="stepperPrevious?.data"
      direction="previous"
      :title="stepperPrevious.data.text?.headline"
      :date="stepperPrevious.data.start_date?.format('MMM D, YYYY')"
      @clicked="handleNavClick"
    />

    <StorySliderSlideNav
      v-if="stepperNext?.data"
      direction="next"
      :title="stepperNext.data.text?.headline"
      :date="stepperNext.data.start_date?.format('MMM D, YYYY')"
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

<script lang="ts" setup>
import type { Language, ProcessedTimelineData, Slide as SlideType, TimelineChangeEvent, TimelineEvent, TimelineOptions } from '../types'
import { useElementSize, useEventListener, useResizeObserver, useSwipe, useTemplateRefsList } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'
import Slide from './Slide.vue'

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
  (e: 'nav_next', payload: any): void
  (e: 'nav_previous', payload: any): void
}>()

// Setup reactive refs
const sliderItemContainer = ref<HTMLDivElement | null>(null)
const backgroundElement = ref<HTMLDivElement | null>(null)
const { width, height } = useElementSize(sliderItemContainer)
const ready = ref(false)
const slides = ref<SlideType[]>([])
const currentIndex = ref<number>(0)

// Use templateRefsList for slide components
const slideRefs = useTemplateRefsList<InstanceType<typeof Slide>>()

// Computed properties for positioning (similar to original StorySlider)
const containerWidth = computed(() => width.value || props.options.width || 600)
const containerHeight = computed(() => height.value || props.options.height || 600)

// Slide spacing - similar to original: slide_spacing = this.options.width * 2
const slideSpacing = computed(() => containerWidth.value)

// Watch for resize to update layout
useResizeObserver(sliderItemContainer, () => {
  updateDisplay(containerWidth.value, containerHeight.value, false, props.options.layout || 'portrait')
})

// Add swipe support
const { isSwiping, direction } = useSwipe(sliderItemContainer, {
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
    emit('nav_next', { direction: 'next' })
  }
}

function previous(): void {
  const n = currentIndex.value
  if (n - 1 >= 0) {
    goTo(n - 1)
    emit('nav_previous', { direction: 'previous' })
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

function updateDisplay(w: number, h: number, animate: boolean, layout: string): void {
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
})
</script>

<template>
  <div class="tl-slider">
    <div
      ref="backgroundElement"
      class="tl-slider-background"
    />
    <div class="tl-slider-container">
      <div
        ref="sliderItemContainer"
        class="tl-slider-item-container"
        :style="{ transform: `translateX(${-currentIndex * slideSpacing}px)` }"
      >
        <Slide
          v-for="(slide, index) in slides"
          :key="slide.id"
          :ref="slideRefs.set"
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

    <!-- Navigation buttons -->
    <button
      v-if="currentIndex > 0"
      class="tl-nav-button tl-nav-previous"
      :aria-label="language.messages?.nav_previous || 'Previous'"
      @click="previous"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
      </svg>
    </button>

    <button
      v-if="currentIndex < slides.length - 1"
      class="tl-nav-button tl-nav-next"
      :aria-label="language.messages?.nav_next || 'Next'"
      @click="next"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.tl-slider {
  width: 100%;
  height: 100%;
  top: 0;
  position: absolute;
  overflow: hidden;

  & .tl-slider-background {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1;
    background-color: #fff;
    transition: background-color 0.3s ease;
  }

  & .tl-slider-container {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 2;
    overflow: hidden;
  }

  & .tl-slider-item-container {
    width: 100%;
    height: 100%;
    position: relative;
    transition: transform 0.5s cubic-bezier(0.86, 0, 0.07, 1);
    will-change: transform;
    touch-action: pan-x;
  }
}


/* Navigation buttons */
.tl-nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 20;
  opacity: 0.8;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    opacity: 1;
    transform: translateY(-50%) scale(1.1);
  }

  &:focus {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }

  & svg {
    fill: currentColor;
  }
}

.tl-nav-previous {
  left: 20px;
}

.tl-nav-next {
  right: 20px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .tl-slide {
    padding: 15px;

    .tl-slide-content {
      padding: 15px;
    }
  }
}
</style>

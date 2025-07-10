<script lang="ts" setup>
import { useTimelineStore } from '@/stores/timelineStore';
import type { Language, ProcessedTimelineData, Slide as SlideType, TimelineChangeEvent, TimelineOptions } from '../../types'

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
const timelineStore = useTimelineStore()
// Setup reactive refs
const storySliderEl = ref<HTMLDivElement | null>(null)
const sliderBackgroundEl = ref<HTMLDivElement | null>(null)
const sliderContainerMaskEl = ref<HTMLDivElement | null>(null)
const sliderContainerEl = ref<HTMLDivElement | null>(null)
const sliderItemContainerEl = ref<HTMLDivElement | null>(null)

const { width, height } = useElementSize(storySliderEl)
const ready = ref(false)

// Use templateRefsList for slide components
const slideRefs = useTemplateRefsList<GlobalComponents['StorySliderSlide']>()

// Computed properties for positioning (similar to original StorySlider)
const containerWidth = computed(() => width.value || props.options.width || 600)
const containerHeight = computed(() => height.value || props.options.height || 600)

// Slide spacing - similar to original: slide_spacing = this.options.width * 2
const slideSpacing = computed(() => containerWidth.value * 2)

useResizeObserver(sliderItemContainerEl, () => {
  updateDisplay(containerWidth.value, containerHeight.value, false, props.options.layout || 'portrait')
})

// Add swipe support
const { direction } = useSwipe(sliderItemContainerEl, {
  onSwipeEnd() {
    if (direction.value === 'left') {
      timelineStore.goToNext()
    }
    else if (direction.value === 'right') {
      timelineStore.goToPrevious()
    }
  },
})

// Initialize on mount
onMounted(() => {
  useEventListener(document, 'keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      emit('navPrevious', { direction: 'previous' })
      timelineStore.goToPrevious()
    }
    else if (e.key === 'ArrowRight') {
      emit('navNext', { direction: 'next' })
      timelineStore.goToNext()
    }
  })
  // Set initial slide based on options
  if (isDefined(timelineStore.options.start_at_slide)) {
    if (typeof timelineStore.options.start_at_slide === 'number') {
      timelineStore.index = timelineStore.options.start_at_slide
    }
    else if (typeof timelineStore.options.start_at_slide === 'string') {
      timelineStore.goTo(timelineStore.options.start_at_slide)
    }
  } else {
      timelineStore.index = 0 // Default to first slide if no valid start
    }
  // Set ready state
  ready.value = true
  emit('loaded')
})

watch(() => timelineStore.index, (newIndex) => {
  goTo(newIndex)
})

// Navigation methods similar to original
function goTo(n: number): void {
  if (n < 0 || n >= timelineStore.stepNames.length)
    return

  if (timelineStore.at(n)) {
    emit('change', timelineStore.at(n)!)
  }
}

function goToId(id: string): void {
  if (id in timelineStore.steps) {
    goTo(timelineStore.stepNames.indexOf(id))
  }
}

function handleNavClick(direction: 'previous' | 'next'): void {
  if (direction === 'previous') {
    emit('navPrevious', { direction: 'previous' })
    timelineStore.goToPrevious()
  }
  else {
    emit('navNext', { direction: 'next' })
    timelineStore.goToNext()
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
  next: timelineStore.goToNext,
  previous: timelineStore.goToPrevious,
  stepperIndex: timelineStore.index,
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
        class="tl-slider-container tl-animate absolute top-0 left-0 w-full h-full text-center transition-all duration-250"
        :style="{ left: `${-timelineStore.index * slideSpacing}px` }"
      >
        <!-- Slider Item Container -->
        <div
          ref="sliderItemContainerEl"
          class="tl-slider-item-container w-full h-full table-cell v-middle"
        >
          <template v-for="(stepName, index) of timelineStore.stepNames">
            <StorySliderSlide
              v-if="index >= timelineStore.index - 1 && index <= timelineStore.index + 1"
              :ref="slideRefs.set"
              :key="stepName"
              :slide="timelineStore.at(index)!"
              :active="index === timelineStore.index"
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
      v-if="timelineStore.previous"
      direction="previous"
      :title="timelineStore.steps[timelineStore.previous!].text?.headline"
      :date="timelineStore.steps[timelineStore.previous!].start_date?.format('MMM D, YYYY')"
      @clicked="handleNavClick"
    />

    <StorySliderSlideNav
      v-if="timelineStore.next"
      direction="next"
      :title="timelineStore.steps[timelineStore.next!].text?.headline"
      :date="timelineStore.steps[timelineStore.next!].start_date?.format('MMM D, YYYY')"
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

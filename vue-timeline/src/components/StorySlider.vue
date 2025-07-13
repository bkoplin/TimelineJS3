<script lang="ts" setup>
import type { Language, ProcessedTimelineData, Slide as SlideType, TimelineChangeEvent, TimelineOptions } from '../types'
import { useTimelineStore } from '@/stores/timelineStore'

// Define props and emits
const emit = defineEmits<{
  (e: 'loaded'): void
  (e: 'change', payload: SlideType): void
  (e: 'colorchange', payload: SlideType): void
  (e: 'navNext', payload: { direction: 'next' }): void
  (e: 'navPrevious', payload: { direction: 'previous' }): void
}>()
const timelineStore = useTimelineStore()
// Setup reactive refs
const storySliderEl = ref<HTMLElement | null>(null)
const sliderBackgroundEl = ref<HTMLDivElement | null>(null)
const sliderContainerMaskEl = ref<HTMLDivElement | null>(null)
const sliderContainerEl = ref<HTMLDivElement | null>(null)
const sliderItemContainerEl = ref<HTMLDivElement | null>(null)

const { width, height } = useElementSize(storySliderEl)
const ready = useMounted()

// Use templateRefsList for slide components
const slideRefs = useTemplateRefsList<GlobalComponents['Slide']>()

// Computed properties for positioning (similar to original StorySlider)
// Slide spacing - similar to original: slide_spacing = this.options.width * 2
const slideSpacing = computed(() => width.value * 2)

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
</script>

<template>
  <!-- .tl-storyslider -->
  <div
    ref="storySliderEl"
    class="tl-storyslider w-full h-full overflow-hidden relative z-8 select-none"
    :style="{ height: `${timelineStore.storySliderHeight}px` }"
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
            <Slide
              v-if="index >= timelineStore.index - 1 && index <= timelineStore.index + 1"
              :ref="slideRefs.set"
              :key="stepName"
              :slide="timelineStore.at(index)!"
              :active="index === timelineStore.index"
              :style="{
                left: `${index * slideSpacing}px`,
                width: `${timelineStore.options.width}px`,
                height: `${height}px`,
              }"
            />
          </template>
        </div>
      </div>
    </div>

    <!-- Navigation components -->
    <SlideNav
      v-if="timelineStore.previous"
      direction="previous"
      :title="timelineStore.steps[timelineStore.previous!].text?.headline"
      :date="timelineStore.steps[timelineStore.previous!].start_date?.format('MMM D, YYYY')"
      @clicked="timelineStore.goToPrevious()"
    />

    <SlideNav
      v-if="timelineStore.next"
      direction="next"
      :title="timelineStore.steps[timelineStore.next!].text?.headline"
      :date="timelineStore.steps[timelineStore.next!].start_date?.format('MMM D, YYYY')"
      @clicked="timelineStore.goToNext()"
    />
  </div>
</template>

<style scoped>
/* StorySlider Styles - Based on TL.StorySlider.less */
</style>

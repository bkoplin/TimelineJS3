<template>
  <div class="timeline-slider" ref="sliderContainer">
    <div class="slider-content" :style="sliderStyle">
      <TimelineSlide
        v-if="title"
        :data="title"
        :is-title="true"
        :is-active="currentIndex === 0"
        @click="$emit('change', 0)"
      />
      
      <TimelineSlide
        v-for="(event, index) in events"
        :key="event.unique_id || index"
        :data="event"
        :is-title="false"
        :is-active="currentIndex === (title ? index + 1 : index)"
        @click="$emit('change', title ? index + 1 : index)"
        @media-loaded="$emit('media-loaded', event.unique_id)"
      />
    </div>
    
    <div class="slider-navigation">
      <button 
        class="nav-button nav-previous"
        @click="goToPrevious"
        :disabled="currentIndex === 0"
      >
        <i class="fa fa-chevron-left"></i>
      </button>
      <button 
        class="nav-button nav-next"
        @click="goToNext"
        :disabled="isLastSlide"
      >
        <i class="fa fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TimelineSlide from './TimelineSlide.vue'
import type { TimelineEvent, TimelineTitle, TimelineOptions } from '@/types/timeline'

interface Props {
  events: readonly TimelineEvent[]
  title?: TimelineTitle
  currentIndex: number
  options: TimelineOptions
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'change': [index: number]
  'media-loaded': [id: string]
}>()

const sliderContainer = ref<HTMLElement>()

const totalSlides = computed(() => {
  return props.events.length + (props.title ? 1 : 0)
})

const isLastSlide = computed(() => {
  return props.currentIndex >= totalSlides.value - 1
})

const sliderStyle = computed(() => ({
  transform: `translateX(-${props.currentIndex * 100}%)`,
  transition: `transform ${props.options.duration}ms ${props.options.ease}`
}))

function goToPrevious() {
  if (props.currentIndex > 0) {
    emit('change', props.currentIndex - 1)
  }
}

function goToNext() {
  if (props.currentIndex < totalSlides.value - 1) {
    emit('change', props.currentIndex + 1)
  }
}
</script>

<style lang="scss" scoped>
.timeline-slider {
  position: relative;
  flex: 1;
  overflow: hidden;
  
  .slider-content {
    display: flex;
    height: 100%;
    will-change: transform;
  }
  
  .slider-navigation {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
    pointer-events: none;
    
    .nav-button {
      pointer-events: auto;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #ccc;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover:not(:disabled) {
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
      
      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      
      i {
        font-size: 20px;
      }
    }
  }
}
</style>

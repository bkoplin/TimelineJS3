<template>
  <div class="timeline-slider" ref="sliderContainer">
    <TransitionGroup
      name="slide"
      tag="div"
      class="slider-content"
      :style="sliderStyle"
    >
      <TimelineSlide
        v-if="title"
        key="title"
        :data="title"
        :is-title="true"
        :is-active="currentIndex === 0"
        @click="$emit('change', 0)"
      />
      
      <TimelineSlide
        v-for="(event, index) in events"
        :key="event.unique_id || `event-${index}`"
        :data="event"
        :is-title="false"
        :is-active="currentIndex === (title ? index + 1 : index)"
        @click="$emit('change', title ? index + 1 : index)"
        @media-loaded="$emit('media-loaded', event.unique_id || `event-${index}`)"
      />
    </TransitionGroup>
    
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
import { computed } from 'vue'
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

const totalSlides = computed(() => {
  return props.events.length + (props.title ? 1 : 0)
})

const isLastSlide = computed(() => {
  return props.currentIndex >= totalSlides.value - 1
})

const sliderStyle = computed(() => ({
  transform: `translateX(-${props.currentIndex * 100}%)`,
  transition: `transform ${props.options.duration || 600}ms ${props.options.ease || 'cubic-bezier(0.4, 0.0, 0.2, 1)'}`
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
  
  // Slide transition animations
  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
  }
  
  .slide-enter-from {
    opacity: 0;
    transform: scale(0.95);
  }
  
  .slide-leave-to {
    opacity: 0;
    transform: scale(0.95);
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
      transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
      
      &:hover:not(:disabled) {
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: scale(1.1);
      }
      
      &:active:not(:disabled) {
        transform: scale(0.95);
      }
      
      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      
      i {
        font-size: 20px;
        transition: transform 0.2s;
      }
      
      &:hover:not(:disabled) i {
        transform: scale(1.2);
      }
    }
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .timeline-slider {
    .slider-content {
      transition: none !important;
    }
    
    .slide-enter-active,
    .slide-leave-active {
      transition: none !important;
    }
    
    .slider-navigation .nav-button {
      transition: none !important;
      
      &:hover:not(:disabled) {
        transform: none;
      }
      
      i {
        transition: none !important;
      }
    }
  }
}
</style>

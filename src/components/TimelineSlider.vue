<template>
  <div class="timeline-slider" ref="sliderContainer">
    <TransitionGroup
      name="slide"
      tag="div"
      class="slider-content"
      :style="sliderStyle"
    >
      <TimelineSlide
        v-for="slide in virtual.visibleSlides.value"
        :key="slide.key"
        :data="slide.data"
        :is-title="slide.type === 'title'"
        :is-active="currentIndex === slide.index"
        @click="$emit('change', slide.index)"
        @media-loaded="$emit('media-loaded', slide.key)"
      />
    </TransitionGroup>
    
    <!-- Virtual scrolling stats (dev mode) -->
    <div v-if="options.debug && virtual.isVirtualEnabled.value" class="virtual-stats">
      Virtual: {{ virtual.stats.value.rendered }}/{{ virtual.stats.value.total }} 
      ({{ virtual.stats.value.memoryReduction }}% reduction)
    </div>
    
    <div class="slider-navigation">
      <button 
        class="nav-button nav-previous"
        @click="goToPrevious"
        :disabled="currentIndex === 0"
      >
        <component :is="iconProvider?.iconRenderers.value.prevSlide()" />
      </button>
      <button 
        class="nav-button nav-next"
        @click="goToNext"
        :disabled="isLastSlide"
      >
        <component :is="iconProvider?.iconRenderers.value.nextSlide()" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, toRef } from 'vue'
import TimelineSlide from './TimelineSlide.vue'
import { useVirtualSlides } from '@/composables/useVirtualSlides'
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

const iconProvider = inject<any>('iconProvider')

// Virtual scrolling composable
const virtual = useVirtualSlides(
  toRef(() => props.events),
  toRef(() => props.title),
  toRef(() => props.currentIndex),
  toRef(() => props.options)
)

const totalSlides = computed(() => virtual.totalSlides.value)

const isLastSlide = computed(() => {
  return props.currentIndex >= totalSlides.value - 1
})

const sliderStyle = computed(() => ({
  transform: `translateX(-${virtual.transformOffset.value}%)`,
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

// Expose stats for debugging
defineExpose({
  virtualStats: virtual.stats
})
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
  
  .virtual-stats {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-family: monospace;
    pointer-events: none;
    z-index: 1000;
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

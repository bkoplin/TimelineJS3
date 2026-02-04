<template>
  <div class="relative flex-1 overflow-hidden" ref="sliderContainer">
    <TransitionGroup
      name="slide"
      tag="div"
      class="flex h-full will-change-transform"
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
    <div v-if="options.debug && virtual.isVirtualEnabled.value" class="absolute top-2.5 right-2.5 bg-black/70 text-white px-2 py-1 rounded text-11px font-mono pointer-events-none z-1000">
      Virtual: {{ virtual.stats.value.rendered }}/{{ virtual.stats.value.total }} 
      ({{ virtual.stats.value.memoryReduction }}% reduction)
    </div>
    
    <div class="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-5 pointer-events-none">
      <button 
        class="nav-button pointer-events-auto bg-white/90 border border-#ccc rounded-full w-48px h-48px flex items-center justify-center cursor-pointer"
        @click="goToPrevious"
        :disabled="currentIndex === 0"
      >
        <component :is="iconProvider?.iconRenderers.value.prevSlide()" class="text-20px" />
      </button>
      <button 
        class="nav-button pointer-events-auto bg-white/90 border border-#ccc rounded-full w-48px h-48px flex items-center justify-center cursor-pointer"
        @click="goToNext"
        :disabled="isLastSlide"
      >
        <component :is="iconProvider?.iconRenderers.value.nextSlide()" class="text-20px" />
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

<style scoped>
/* Slide transition animations */
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

.nav-button {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.nav-button:hover:not(:disabled) {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: scale(1.1);
}

.nav-button:active:not(:disabled) {
  transform: scale(0.95);
}

.nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-button i {
  transition: transform 0.2s;
}

.nav-button:hover:not(:disabled) i {
  transform: scale(1.2);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .slide-enter-active,
  .slide-leave-active {
    transition: none !important;
  }
  
  .nav-button {
    transition: none !important;
  }
  
  .nav-button:hover:not(:disabled) {
    transform: none;
  }
  
  .nav-button i {
    transition: none !important;
  }
}
</style>

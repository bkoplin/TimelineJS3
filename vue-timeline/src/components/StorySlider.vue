<template>
  <div class="tl-slider">
    <div class="tl-slider-background"></div>
    <div class="tl-slider-container">
      <div ref="sliderItemContainer" class="tl-slider-item-container">
        <Slide
          v-for="(slide, index) in slides"
          :key="slide.id"
          :ref="slideRefs.set"
          :slide="slide"
          :active="index === currentIndex"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useElementSize, useEventListener, useTemplateRefsList } from '@vueuse/core'
import Slide from './Slide.vue'
import type { TimelineData, TimelineOptions, Slide as SlideType, TimelineChangeEvent, Language } from '../types'

// Define props and emits
const props = defineProps<{
  data: TimelineData
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
const { width, height } = useElementSize(sliderItemContainer)
const ready = ref(false)
const slides = ref<SlideType[]>([])
const currentIndex = ref<number>(0)

// Use templateRefsList for slide components
const slideRefs = useTemplateRefsList<InstanceType<typeof Slide>>()

// Initialize on mount
onMounted(() => {
  _initEvents()
  _createSlides()
  
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
      emit('nav_previous', {})
    } else if (e.key === 'ArrowRight') {
      emit('nav_next', {})
    }
  })
}

function _createSlides() {
  const newSlides: SlideType[] = []
  if (props.data.title && props.data.title.unique_id) {
    newSlides.push({
      data: props.data.title,
      position: 0,
      id: props.data.title.unique_id,
    })
  }
  
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

// Public methods - expose with defineExpose
function goToId(id: string): void {
  const index = slides.value.findIndex(slide => slide.id === id)
  if (index !== -1) {
    currentIndex.value = index
    emit('change', { unique_id: id })
  }
}

function updateDisplay(w: number, h: number, animate: boolean, layout: string): void {
  // This can be used for responsive logic if needed
}

// Expose public methods
defineExpose({
  ready,
  goToId,
  updateDisplay,
})
</script>

<style scoped>
.tl-slider {
  width: 100%;
  height: 100%;
  position: relative;
}

.tl-slider-background {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 1;
}

.tl-slider-container {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
}

.tl-slider-item-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.tl-slide {
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.5s ease;
  overflow-y: auto;
}

.tl-slide-active {
  opacity: 1;
  z-index: 10;
}

.tl-slide-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.tl-media {
  margin: 20px 0;
}

.tl-media img {
  max-width: 100%;
  height: auto;
}

.tl-caption {
  font-style: italic;
  margin-top: 8px;
  color: #666;
}
</style>

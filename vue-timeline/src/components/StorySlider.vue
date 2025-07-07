<template>
  <div class="tl-slider">
    <div class="tl-slider-background"></div>
    <div class="tl-slider-container">
      <div ref="sliderItemContainer" class="tl-slider-item-container"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useElementSize, useEventListener } from '@vueuse/core'
import { TLError } from '../core/TLError'

// Define props and emits
const props = defineProps<{
  data: any
  options: any
  language: any
}>()

const emit = defineEmits<{
  (e: 'loaded'): void
  (e: 'change', payload: { unique_id: string }): void
  (e: 'colorchange', payload: { unique_id: string }): void
  (e: 'nav_next', payload: any): void
  (e: 'nav_previous', payload: any): void
}>()

// Setup reactive refs
const sliderItemContainer = ref<HTMLDivElement | null>(null)
const { width, height } = useElementSize(sliderItemContainer)
const ready = $ref(false)
const _slides = $ref<any[]>([])
const currentIndex = $ref<number>(0)

// Initialize on mount
onMounted(() => {
  _initLayout()
  _initEvents()
  _createSlides()
  
  // Set ready state
  ready = true
  emit('loaded')
})

// Watch for data changes
watch(() => props.data, (newData) => {
  if (ready) {
    // Update slides based on data changes
    _createSlides()
  }
}, { deep: true })

// Watch for size changes
watch([width, height], () => {
  if (ready) {
    _updateDrawSlides()
  }
})

// Component methods
function _initLayout() {
  // Initialize layout elements
  if (sliderItemContainer.value) {
    // Additional setup if needed
  }
}

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
  _slides = []
  
  if (props.data.title) {
    _createSlide(props.data.title, 0)
  }
  
  if (props.data.events) {
    for (let i = 0; i < props.data.events.length; i++) {
      _createSlide(props.data.events[i], props.data.title ? i + 1 : i)
    }
  }
}

function _createSlide(data: any, position: number) {
  // Create a slide element based on the data
  const slide = {
    data,
    position,
    id: data.unique_id,
    element: document.createElement('div')
  }
  
  slide.element.className = 'tl-slide'
  slide.element.dataset.slideIndex = position.toString()
  
  // Add content to slide
  const content = document.createElement('div')
  content.className = 'tl-slide-content'
  
  // Add headline
  const headline = document.createElement('h2')
  headline.textContent = data.text?.headline || ''
  content.appendChild(headline)
  
  // Add text
  const text = document.createElement('div')
  text.innerHTML = data.text?.text || ''
  content.appendChild(text)
  
  // Add media if present
  if (data.media?.url) {
    const media = document.createElement('div')
    media.className = 'tl-media'
    
    const img = document.createElement('img')
    img.src = data.media.url
    img.alt = data.media.caption || ''
    media.appendChild(img)
    
    if (data.media.caption) {
      const caption = document.createElement('div')
      caption.className = 'tl-caption'
      caption.textContent = data.media.caption
      media.appendChild(caption)
    }
    
    content.appendChild(media)
  }
  
  slide.element.appendChild(content)
  sliderItemContainer.value?.appendChild(slide.element)
  _slides.push(slide)
}

function _updateDrawSlides() {
  // Update slide positions and visibility
  _slides.forEach((slide, index) => {
    if (index === currentIndex) {
      slide.element.classList.add('tl-slide-active')
    } else {
      slide.element.classList.remove('tl-slide-active')
    }
  })
}

// Public methods - expose with defineExpose
function goToId(id: string, fast = false, noAnimation = false): void {
  const index = _slides.findIndex(slide => slide.id === id)
  if (index !== -1) {
    currentIndex = index
    _updateDrawSlides()
    emit('change', { unique_id: id })
  }
}

function createSlide(data: any, position: number): void {
  _createSlide(data, position)
  _updateDrawSlides()
}

function destroySlide(index: number): void {
  if (_slides[index]) {
    _slides[index].element.remove()
    _slides.splice(index, 1)
    _updateDrawSlides()
  }
}

function updateDisplay(w: number, h: number, animate: boolean, layout: string): void {
  _updateDrawSlides()
}

// Expose public methods
defineExpose({
  ready,
  goToId,
  createSlide,
  destroySlide,
  updateDisplay,
  _updateDrawSlides
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

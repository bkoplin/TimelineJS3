<script lang="ts" setup>
import { useElementBounding, useElementSize } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'

export interface TimeMarkerData {
  unique_id: string
  start_date: any
  end_date?: any
  headline: string
  text?: string
  media?: any
  background?: any
  display_date?: string
}

export interface TimeMarkerOptions {
  marker_height_min: number
  marker_width_min: number
  marker_padding: number
}

const props = defineProps<{
  data: TimeMarkerData
  options: TimeMarkerOptions
}>()

const emit = defineEmits<{
  (e: 'markerclick', payload: { unique_id: string }): void
  (e: 'markerfocus', payload: { unique_id: string }): void
  (e: 'markerblur', payload: { unique_id: string }): void
  (e: 'added'): void
}>()

// Reactive refs
const markerEl = ref<HTMLDivElement | null>(null)
const flagEl = ref<HTMLDivElement | null>(null)
const contentEl = ref<HTMLDivElement | null>(null)

const { width, height } = useElementSize(markerEl)
const { left, top } = useElementBounding(markerEl)

// State
const isActive = ref(false)
const isFocused = ref(false)
const currentClass = ref('tl-timemarker')

// Computed properties
const ariaLabel = computed(() => {
  return `${props.data.headline}, ${props.data.display_date || formatDate(props.data.start_date)}`
})

const markerStyle = computed(() => ({
  position: 'absolute' as const,
  minHeight: `${props.options.marker_height_min}px`,
  minWidth: `${props.options.marker_width_min}px`,
}))

// Methods
function setClass(className: string): void {
  currentClass.value = className
}

function setPosition(position: { left: number, top?: number }): void {
  if (markerEl.value) {
    markerEl.value.style.left = `${position.left}px`
    if (position.top !== undefined) {
      markerEl.value.style.top = `${position.top}px`
    }
  }
}

function setWidth(w: number): void {
  if (markerEl.value) {
    markerEl.value.style.width = `${w}px`
  }
}

function setHeight(h: number): void {
  if (markerEl.value) {
    markerEl.value.style.height = `${h}px`
  }
}

function setRowPosition(y: number, remainderHeight: number): void {
  if (markerEl.value) {
    markerEl.value.style.top = `${y}px`
    markerEl.value.style.maxHeight = `${remainderHeight}px`
  }
}

function setActive(active: boolean): void {
  isActive.value = active
  if (markerEl.value) {
    if (active) {
      markerEl.value.classList.add('tl-timemarker-active')
    }
    else {
      markerEl.value.classList.remove('tl-timemarker-active')
    }
  }
}

function setFocus(): void {
  isFocused.value = true
  if (markerEl.value) {
    markerEl.value.focus()
    markerEl.value.classList.add('tl-timemarker-focused')
    emit('markerfocus', { unique_id: props.data.unique_id })
  }
}

function removeFocus(): void {
  isFocused.value = false
  if (markerEl.value) {
    markerEl.value.classList.remove('tl-timemarker-focused')
    emit('markerblur', { unique_id: props.data.unique_id })
  }
}

function getLeft(): number {
  return left.value
}

function getTop(): number {
  return top.value
}

function getWidth(): number {
  return width.value
}

function getHeight(): number {
  return height.value
}

// Event handlers
function onClick(): void {
  emit('markerclick', { unique_id: props.data.unique_id })
}

function onFocus(): void {
  setFocus()
}

function onBlur(): void {
  removeFocus()
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    onClick()
  }
}

// Utility functions
function formatDate(dateInput: any): string {
  let date: Date
  
  if (dateInput && typeof dateInput === 'object' && dateInput.date) {
    date = new Date(dateInput.date)
  }
  else {
    date = new Date(dateInput)
  }
  
  if (Number.isNaN(date.getTime())) {
    return 'Invalid Date'
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Lifecycle
onMounted(() => {
  emit('added')
})

// Expose methods for parent components
defineExpose({
  setClass,
  setPosition,
  setWidth,
  setHeight,
  setRowPosition,
  setActive,
  setFocus,
  removeFocus,
  getLeft,
  getTop,
  getWidth,
  getHeight,
  data: props.data,
  ariaLabel,
})
</script>

<template>
  <div
    ref="markerEl"
    :class="currentClass"
    :style="markerStyle"
    :aria-label="ariaLabel"
    tabindex="0"
    role="button"
    @click="onClick"
    @focus="onFocus"
    @blur="onBlur"
    @keydown="onKeydown"
  >
    <div
      ref="flagEl"
      class="tl-timemarker-flag"
    >
      <div class="tl-timemarker-flag-content">
        <h3 class="tl-timemarker-headline">
          {{ data.headline }}
        </h3>
        <p
          v-if="data.text"
          class="tl-timemarker-text"
        >
          {{ data.text }}
        </p>
      </div>
    </div>
    
    <div
      ref="contentEl"
      class="tl-timemarker-content"
    >
      <div class="tl-timemarker-content-container">
        <div
          v-if="data.media"
          class="tl-timemarker-media"
        >
          <!-- Media content would go here -->
          <div class="tl-timemarker-media-placeholder">
            Media: {{ data.media.url || 'No URL' }}
          </div>
        </div>
        
        <div class="tl-timemarker-date">
          {{ data.display_date || formatDate(data.start_date) }}
        </div>
      </div>
    </div>
    
    <div class="tl-timemarker-line" />
  </div>
</template>

<style scoped>
.tl-timemarker {
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;

  &:hover {
    transform: scale(1.02);
  }

  &:focus {
    outline: 2px solid #007cba;
    outline-offset: 2px;
  }

  &-active {
    z-index: 10;
  }

  &-focused {
    z-index: 11;
  }

  &-fast {
    transition: none;
  }

  &-flag {
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px;
    margin-bottom: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  &-headline {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: bold;
    line-height: 1.2;
  }

  &-text {
    margin: 0;
    font-size: 12px;
    line-height: 1.3;
    color: #666;
  }

  &-content {
    position: relative;

    &-container {
      background: #f8f8f8;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 6px;
    }
  }

  &-media {
    &-placeholder {
      background: #eee;
      padding: 8px;
      border-radius: 2px;
      font-size: 11px;
      color: #999;
      text-align: center;
      margin-bottom: 4px;
    }
  }

  &-date {
    font-size: 11px;
    color: #888;
    text-align: center;
  }

  &-line {
    position: absolute;
    bottom: -10px;
    left: 50%;
    width: 2px;
    height: 10px;
    background: #ccc;
    transform: translateX(-50%);
  }
}
</style>

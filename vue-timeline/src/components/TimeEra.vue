<script lang="ts" setup>
import { useElementBounding, useElementSize } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'

export interface TimeEraData {
  start_date: any
  end_date: any
  headline: string
  text?: string
  background?: {
    color?: string
    opacity?: number
  }
}

const props = defineProps<{
  startDate: any
  endDate: any
  headline: string
  options: any
}>()

const emit = defineEmits<{
  (e: 'added'): void
}>()

// Reactive refs
const eraEl = ref<HTMLDivElement | null>(null)
const { width, height } = useElementSize(eraEl)
const { left, top } = useElementBounding(eraEl)

// State
const currentClass = ref('tl-timeera')
const colorIndex = ref(0)

// Computed properties
const start_date = computed(() => {
  return typeof props.startDate === 'string' ? new Date(props.startDate) : props.startDate
})

const end_date = computed(() => {
  return typeof props.endDate === 'string' ? new Date(props.endDate) : props.endDate
})

const eraStyle = computed(() => ({
  position: 'absolute' as const,
  backgroundColor: getColorForIndex(colorIndex.value),
  opacity: 0.3,
  height: '100%',
  borderRadius: '4px',
}))

const duration = computed(() => {
  const startTime = start_date.value.getTime()
  const endTime = end_date.value.getTime()
  const diffTime = Math.abs(endTime - startTime)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays > 365) {
    const years = Math.floor(diffDays / 365)
    return `${years} year${years !== 1 ? 's' : ''}`
  }
  else if (diffDays > 30) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months !== 1 ? 's' : ''}`
  }
  else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`
  }
})

// Methods
function setClass(className: string): void {
  currentClass.value = className
}

function setPosition(position: { left: number, top?: number }): void {
  if (eraEl.value) {
    eraEl.value.style.left = `${position.left}px`
    if (position.top !== undefined) {
      eraEl.value.style.top = `${position.top}px`
    }
  }
}

function setWidth(w: number): void {
  if (eraEl.value) {
    eraEl.value.style.width = `${w}px`
  }
}

function setHeight(h: number): void {
  if (eraEl.value) {
    eraEl.value.style.height = `${h}px`
  }
}

function setColor(index: number): void {
  colorIndex.value = index % 6 // Cycle through 6 colors
  if (eraEl.value) {
    eraEl.value.style.backgroundColor = getColorForIndex(colorIndex.value)
  }
}

function getColorForIndex(index: number): string {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
  ]
  return colors[index] || colors[0]
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

function formatDate(date: Date): string {
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
  setColor,
  getLeft,
  getTop,
  getWidth,
  getHeight,
  start_date,
  end_date,
  headline: props.headline,
})
</script>

<template>
  <div
    ref="eraEl"
    :class="currentClass"
    :style="eraStyle"
    :title="`${headline}: ${formatDate(start_date)} - ${formatDate(end_date)} (${duration})`"
  >
    <div class="tl-timeera-content">
      <div class="tl-timeera-headline">
        {{ headline }}
      </div>
      <div class="tl-timeera-duration">
        {{ duration }}
      </div>
      <div class="tl-timeera-dates">
        {{ formatDate(start_date) }} - {{ formatDate(end_date) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.tl-timeera {
  border: 1px solid rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.tl-timeera:hover {
  opacity: 0.5 !important;
  transform: scale(1.01);
}

.tl-timeera-fast {
  transition: none;
}

.tl-timeera-content {
  padding: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  color: rgba(0, 0, 0, 0.8);
}

.tl-timeera-headline {
  font-weight: bold;
  font-size: 12px;
  line-height: 1.2;
  margin-bottom: 4px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.tl-timeera-duration {
  font-size: 10px;
  font-style: italic;
  margin-bottom: 2px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.tl-timeera-dates {
  font-size: 9px;
  opacity: 0.8;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

/* Era color variants */
.tl-timeera.tl-timeera-0 {
  background-color: #FF6B6B;
}

.tl-timeera.tl-timeera-1 {
  background-color: #4ECDC4;
}

.tl-timeera.tl-timeera-2 {
  background-color: #45B7D1;
}

.tl-timeera.tl-timeera-3 {
  background-color: #96CEB4;
}

.tl-timeera.tl-timeera-4 {
  background-color: #FFEAA7;
}

.tl-timeera.tl-timeera-5 {
  background-color: #DDA0DD;
}
</style>

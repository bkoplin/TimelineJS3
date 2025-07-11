<script lang="ts" setup>
import type { TimelineEvent, TimeMarkerData, TimeMarkerOptions } from '../../../types'

const props = defineProps<{
  data: TimelineEvent & { start_date_millisecond: number, end_date_millisecond?: number }
  options: TimeMarkerOptions
}>()
const emit = defineEmits<{
  (e: 'markerclick', payload: { unique_id: string }): void
  (e: 'markerfocus', payload: { unique_id: string }): void
  (e: 'markerblur', payload: { unique_id: string }): void
  (e: 'added'): void
}>()
const timelineStore = useTimelineStore()
const leftPosition = computed(() => timelineStore.scales.markerScale(props.data.start_date_millisecond))
// Reactive refs
const markerEl = ref<HTMLDivElement | null>(null)
const contentEl = ref<HTMLDivElement | null>(null)
const headlineEl = ref<HTMLHeadingElement | null>(null)

const { left, top, width, height } = useElementBounding(markerEl)

// State
const isActive = ref(false)
const isFocused = ref(false)
const isFast = ref(false)

// Computed properties for dynamic classes
const shouldShowFadeout = computed(() => {
  // Match the original logic for fadeout
  const textLines = height.value / 12 // text_line_height = 12
  return textLines > 1 && height.value > 56
})

const markerClasses = computed(() => ({
  'tl-timemarker-with-end': !!props.data.end_date,
  'tl-timemarker-active': isActive.value,
  'tl-timemarker-focused': isFocused.value,
  'tl-timemarker-fast': isFast.value,
}))

const contentContainerClasses = computed(() => ({
  'tl-timemarker-content-container-small': height.value < 56,
  'tl-timemarker-content-container-long': props.data.end_date && width.value > props.options.marker_width_min,
}))

const contentClasses = computed(() => ({
  'tl-timemarker-content-small': height.value <= 30,
}))

const headlineClasses = computed(() => ({
  'tl-headline-fadeout': shouldShowFadeout.value,
}))

const ariaLabel = computed(() => {
  const dateText = props.data.display_date || formatDate(props.data.start_date)
  const label = `${props.data.text.headline}, ${dateText}`
  if (isActive.value) {
    return `${label}, shown`
  }
  return `${label}, press space to show`
})

const markerStyle = computed(() => ({
  position: 'absolute' as const,
  minHeight: `${props.options.marker_height_min}px`,
  minWidth: `${props.options.marker_width_min}px`,
}))

// Methods
function setClass(className: string): void {
  // Update the marker class based on the className passed
  // This matches the original implementation where setClass updates the container className
  if (className.includes('tl-timemarker-active')) {
    isActive.value = true
  }
  else {
    isActive.value = false
  }

  if (className.includes('tl-timemarker-fast')) {
    isFast.value = true
  }
  else {
    isFast.value = false
  }

  // Handle end date class state (this is typically set via props.data.end_date)
  // Focus state is handled separately via focus events
}

const mediaType = computed(() => {
  // Simple media type detection based on URL or type
  if (!props.data.media || !props.data.media.url) {
    return 'default'
  }

  const url = props.data.media.url.toLowerCase()
  if (url.includes('youtube') || url.includes('youtu.be')) {
    return 'youtube'
  }
  if (url.includes('vimeo')) {
    return 'vimeo'
  }
  if (url.includes('twitter') || url.includes('x.com')) {
    return 'twitter'
  }
  if (url.includes('wikipedia')) {
    return 'wikipedia'
  }
  if (url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return 'image'
  }
  if (url.match(/\.(mp4|webm|ogg)$/)) {
    return 'video'
  }
  if (url.match(/\.(mp3|wav|ogg)$/)) {
    return 'audio'
  }

  return 'website'
})

const headlineText = computed(() => {
  if (props.data.text?.headline && props.data.text.headline.trim() !== '') {
    return props.data.text.headline
  }
  else if (props.data.text && props.data.text.text?.trim() !== '') {
    return props.data.text.text
  }
  else if (props.data.media && props.data.media.caption && props.data.media.caption.trim() !== '') {
    return props.data.media.caption
  }
  return ''
})

function setPosition(position: { left: number, top?: number }): void {
  if (markerEl.value) {
    // markerEl.value.style.left = `${position.left}px`
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
}

function setFocus(): void {
  isFocused.value = true
  if (markerEl.value) {
    markerEl.value.focus()
    emit('markerfocus', { unique_id: props.data.unique_id })
  }
}

function removeFocus(): void {
  isFocused.value = false
  if (markerEl.value) {
    emit('markerblur', { unique_id: props.data.unique_id })
  }
}

function setFast(fast: boolean): void {
  isFast.value = fast
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
  setFast,
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
    :id="`${data.unique_id}-marker`"
    ref="markerEl"
    class="absolute"
    :class="{
      'tl-timemarker-with-end': !!$props.data.end_date,
      'tl-timemarker-active': isActive,
      'tl-timemarker-focused': isFocused,
      'tl-timemarker-fast': isFast,
    }"
    :style="{
      minHeight: `${$props.options.marker_height_min}px`,
      minWidth: `${$props.options.marker_width_min}px`,
      left: `${leftPosition}px`,
    }"
    tabindex="-1"
    role="button"
    @click="onClick"
    @focus="onFocus"
    @blur="onBlur"
    @keydown="onKeydown"
  >
    <!-- Timespan -->
    <div class="pointer-events-none absolute m-0 w-[100%] h-[100%] bg-[rgba(235,235,235,0.15)] border-t---time-marker-border-radius border-t---time-marker-border-radius transition-all duration---animation-duration-fast ease---animation-ease">
      <!-- Timespan Content (only for end dates) -->
      <div
        v-if="$props.data.end_date"
        class="hidden absolute w-[100%] bg-[var(--marker-color)] border-t-[var(--time-marker-border-radius)] border-t-[var(--time-marker-border-radius)] h-[100px] box-border"
      />

      <!-- Line Left -->
      <div class="w-[1px] left-[0px] mt-[var(--marker-dot-offset)] box-border border-l-[1px] border-l-solid border-l-[var(--marker-outline-color)] z-5 content-[] absolute h-full shadow-xs" />

      <!-- Line Right (only for end dates) -->
      <div
        v-if="$props.data.end_date"
        class="hidden right-[0px] w-[1px] mt-[var(--marker-dot-offset)] box-border border-l-[1px] border-l-solid border-l-[var(--marker-outline-color)] z-5 content-[] absolute h-[100%] shadow-[1px_1px_1px_var(--color-background)]"
      />
    </div>

    <!-- Content Container -->
    <div
      ref="contentEl"
      class="tl-timemarker-content-container"
      :class="{
        'tl-timemarker-content-container-small': height < 56,
        'tl-timemarker-content-container-long': $props.data.end_date && width > $props.options.marker_width_min,
      }"
    >
      <!-- Content -->
      <div
        class="tl-timemarker-content"
        :class="{
          'tl-timemarker-content-small': height <= 30,
        }"
      >
        <!-- Media Container -->
        <div
          v-if="$props.data.media"
          class="tl-timemarker-media-container"
        >
          <!-- Media Thumbnail -->
          <img
            v-if="$props.data.media?.thumbnail"
            class="tl-timemarker-media"
            :src="$props.data.media.thumbnail"
            :alt="$props.data.media.caption || ''"
          >
          <!-- Media Icon -->
          <span
            v-else
            class="block"
            :class="`tl-icon-${mediaType}`"
          />
        </div>

        <!-- Text Content -->
        <div class="tl-timemarker-text">
          <h2
            ref="headlineEl"
            class="tl-headline"
            :class="{
              'tl-headline-fadeout': shouldShowFadeout,
            }"
            v-html="headlineText"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* CSS Custom Properties for Timeline Variables */
:root {
  /* Colors based on LESS Variables */
  --color-background: #FFF;
  --color-foreground: #333;
  --color-dark: #000;
  --color-theme: #c34528;

  --ui-background-color: #f2f2f2; /* darken(@color-background, 5) */
  --marker-color: #ebebeb; /* darken(@ui-background-color, 5) */
  --marker-outline-color: #d9d9d9; /* darken(@ui-background-color, 10) */
  --marker-text-color: #c2c2c2; /* darken(@marker-color, 15) */
  --marker-selected-text-color: #FFF;
  --marker-dot-color: #9e9e9e; /* darken(@marker-color, 33) */
  --marker-dot-hover-color: #6b6b6b; /* darken(@marker-dot-color, 33) */

  /* Sizes */
  --time-marker-border-radius: 4px;
  --marker-icon-size: 24px;
  --marker-dot-offset: 7px;

  /* Animation */
  --animation-duration: 1000ms;
  --animation-duration-fast: 500ms;
  --animation-ease: cubic-bezier(0.770, 0.000, 0.175, 1.000);
}

/* TimeMarker Base Styles */
.tl-timemarker {
  @apply h-full absolute top-0 left-0 cursor-pointer transition-all duration---animation-duration

  /* Animations */
  transition-timing-function: var(--animation-ease);
}

.tl-timemarker.tl-timemarker-fast {
  @apply duration---animation-duration-fast;
}

/* Timespan */
.tl-timemarker-timespan {
  pointer-events: none;
  position: absolute;
  margin: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(235, 235, 235, 0.15); /* fadeout(@marker-color, 85%) */
  border-top-right-radius: var(--time-marker-border-radius);
  border-top-left-radius: var(--time-marker-border-radius);

  transition-property: height, width;
  transition-duration: var(--animation-duration-fast), var(--animation-duration);
  transition-timing-function: var(--animation-ease);
}

.tl-timemarker-timespan-content {
  display: none;
  position: absolute;
  width: 100%;
  background-color: var(--marker-color);
  border-top-left-radius: var(--time-marker-border-radius);
  border-top-right-radius: var(--time-marker-border-radius);
  height: 100px;
  box-sizing: border-box;
}

/* Lines */
.tl-timemarker-line-left {
  width: 1px;
  left: 0px;
  margin-top: var(--marker-dot-offset);
  box-sizing: border-box;
  border-left: 1px solid var(--marker-outline-color);
  z-index: 5;
  content: " ";
  position: absolute;
  height: 100%;
  box-shadow: 1px 1px 1px var(--color-background);
}

.tl-timemarker-line-right {
  display: none;
  right: 0px;
  width: 1px;
  margin-top: var(--marker-dot-offset);
  box-sizing: border-box;
  border-left: 1px solid var(--marker-outline-color);
  z-index: 5;
  content: " ";
  position: absolute;
  height: 100%;
  box-shadow: 1px 1px 1px var(--color-background);
}

.tl-timemarker-line-left::after,
.tl-timemarker-line-right::after {
  display: block;
  content: " ";
  position: absolute;
  left: -4px;
  bottom: 0px;
  height: 6px;
  width: 6px;
  background-color: var(--marker-dot-color);
  z-index: 8;
  border-radius: 50%;
}

/* Content Container */
.tl-timemarker-content-container {
  position: absolute;
  background-color: var(--marker-color);
  border: 0;
  border-top-left-radius: var(--time-marker-border-radius);
  border-top-right-radius: var(--time-marker-border-radius);
  border-bottom-right-radius: var(--time-marker-border-radius);
  height: 100%;
  width: 100px;
  overflow: hidden;
  z-index: 6;
  box-sizing: border-box;
  border: 1px solid var(--marker-outline-color);
  box-shadow: 1px 1px 1px var(--color-background);

  transition-property: height, width;
  transition-duration: var(--animation-duration-fast), var(--animation-duration);
  transition-timing-function: var(--animation-ease);
}

.tl-timemarker-content-container:hover {
  z-index: 9;
}

.tl-timemarker-content {
  position: relative;
  overflow: hidden;
  height: 100%;
  z-index: 8;
  padding: 5px;
  box-sizing: border-box;
}

/* Text Content */
.tl-timemarker-text {
  overflow: hidden;
  position: relative;
}

.tl-timemarker-text h2.tl-headline {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  box-orient: vertical;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  font-size: 12px;
  line-height: 12px;
  height: 100%;
  overflow: hidden;
  font-weight: normal;
  margin: 0;
  color: var(--marker-text-color);
  position: relative;
}

.tl-timemarker-text h2.tl-headline.tl-headline-fadeout::after {
  content: "";
  text-align: right;
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(to bottom, transparent 0%, var(--marker-color) 50%);
}

/* Media Container */
.tl-timemarker-media-container {
  float: left;
  max-width: var(--marker-icon-size);
  max-height: var(--marker-icon-size);
  overflow: hidden;
  margin-right: 5px;
  height: 100%;
  box-sizing: border-box;
}

.tl-timemarker-media {
  max-width: var(--marker-icon-size);
  max-height: 100%;
  opacity: 0.25;
}

[class^="tl-icon-"],
[class*=" tl-icon-"] {
  display: block;
  font-size: var(--marker-icon-size);
  color: var(--marker-text-color);
  margin-top: 0px;
  font-family: 'Font Awesome 5 Free', 'Font Awesome 5 Brands', sans-serif;
  font-weight: 900;
}

.tl-icon-wikipedia {
  font-size: 16px;
}

/* Small Content State */
.tl-timemarker-content-small .tl-timemarker-text h2.tl-headline {
  display: block;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.tl-timemarker-content-small .tl-timemarker-media-container [class^="tl-icon-"],
.tl-timemarker-content-small .tl-timemarker-media-container [class*=" tl-icon-"] {
  font-size: calc(var(--marker-icon-size) / 2);
}

/* Hover and Focus States */
.tl-timemarker:hover .tl-timemarker-timespan,
.tl-timemarker:focus .tl-timemarker-timespan {
  background-color: rgba(194, 194, 194, 0.25); /* fadeout(@marker-text-color, 75%) */
}

.tl-timemarker:hover .tl-timemarker-timespan .tl-timemarker-timespan-content,
.tl-timemarker:focus .tl-timemarker-timespan .tl-timemarker-timespan-content {
  background-color: var(--marker-text-color);
}

.tl-timemarker:hover .tl-timemarker-line-left,
.tl-timemarker:hover .tl-timemarker-line-right,
.tl-timemarker:focus .tl-timemarker-line-left,
.tl-timemarker:focus .tl-timemarker-line-right {
  border-color: #b0b0b0; /* darken(@marker-color, 25) */
}

.tl-timemarker:hover .tl-timemarker-line-left::after,
.tl-timemarker:hover .tl-timemarker-line-right::after,
.tl-timemarker:focus .tl-timemarker-line-left::after,
.tl-timemarker:focus .tl-timemarker-line-right::after {
  background-color: var(--marker-dot-hover-color);
}

.tl-timemarker:hover .tl-timemarker-content-container,
.tl-timemarker:focus .tl-timemarker-content-container {
  background-color: #8a8a8a; /* darken(@marker-color, 45) */
  border-color: #b0b0b0; /* darken(@marker-color, 25) */
  transition-duration: calc(var(--animation-duration-fast) / 2);
}

.tl-timemarker:hover .tl-timemarker-content-container.tl-timemarker-content-container-small,
.tl-timemarker:focus .tl-timemarker-content-container.tl-timemarker-content-container-small {
  width: 200px;
}

.tl-timemarker:hover .tl-timemarker-content .tl-timemarker-text h2.tl-headline,
.tl-timemarker:focus .tl-timemarker-content .tl-timemarker-text h2.tl-headline {
  color: var(--marker-selected-text-color);
}

.tl-timemarker:hover .tl-timemarker-content .tl-timemarker-text h2.tl-headline.tl-headline-fadeout::after,
.tl-timemarker:focus .tl-timemarker-content .tl-timemarker-text h2.tl-headline.tl-headline-fadeout::after {
  background: linear-gradient(to bottom, transparent 0%, #8a8a8a 80%);
}

.tl-timemarker:hover .tl-timemarker-media,
.tl-timemarker:focus .tl-timemarker-media {
  opacity: 1;
}

.tl-timemarker:hover [class^="tl-icon-"],
.tl-timemarker:hover [class*=" tl-icon-"],
.tl-timemarker:focus [class^="tl-icon-"],
.tl-timemarker:focus [class*=" tl-icon-"] {
  color: var(--marker-selected-text-color);
}

/* Focus-visible State */
.tl-timemarker:focus-visible {
  outline: none;
}

/* Active State */
.tl-timemarker.tl-timemarker-active .tl-timemarker-timespan {
  background-color: rgba(255, 255, 255, 0.5); /* fadeout(@color-background, 50%) */
  z-index: 8;
}

.tl-timemarker.tl-timemarker-active .tl-timemarker-timespan .tl-timemarker-timespan-content {
  background-color: var(--color-foreground);
}

.tl-timemarker.tl-timemarker-active .tl-timemarker-line-left,
.tl-timemarker.tl-timemarker-active .tl-timemarker-line-right {
  border-color: rgba(51, 51, 51, 0.5); /* fadeout(@color-foreground, 50%) */
  border-width: 1px;
  z-index: 8;
  box-shadow: 0px 1px 3px rgba(158, 158, 158, 0.5);
}

.tl-timemarker.tl-timemarker-active .tl-timemarker-line-left::after,
.tl-timemarker.tl-timemarker-active .tl-timemarker-line-right::after {
  background-color: var(--color-foreground);
}

.tl-timemarker.tl-timemarker-active .tl-timemarker-content-container {
  background-color: var(--color-background);
  color: var(--color-foreground);
  z-index: 9;
  border-color: rgba(51, 51, 51, 0.5);
  box-shadow: 1px 1px 3px rgba(158, 158, 158, 0.5);
}

.tl-timemarker.tl-timemarker-active .tl-timemarker-content .tl-timemarker-text h2.tl-headline {
  color: var(--color-foreground);
}

.tl-timemarker.tl-timemarker-active .tl-timemarker-content .tl-timemarker-text h2.tl-headline.tl-headline-fadeout::after {
  background: linear-gradient(to bottom, transparent 0%, var(--color-background) 80%);
}

.tl-timemarker.tl-timemarker-active .tl-timemarker-media {
  opacity: 1;
}

.tl-timemarker.tl-timemarker-active [class^="tl-icon-"],
.tl-timemarker.tl-timemarker-active [class*=" tl-icon-"] {
  color: var(--color-foreground);
}

/* Active Hover State */
.tl-timemarker.tl-timemarker-active:hover .tl-timemarker-content .tl-timemarker-text h2.tl-headline.tl-headline-fadeout::after,
.tl-timemarker.tl-timemarker-active:focus .tl-timemarker-content .tl-timemarker-text h2.tl-headline.tl-headline-fadeout::after {
  background: linear-gradient(to bottom, transparent 0%, var(--color-background) 80%);
}

.tl-timemarker.tl-timemarker-active:hover .tl-timemarker-line-left,
.tl-timemarker.tl-timemarker-active:hover .tl-timemarker-line-right,
.tl-timemarker.tl-timemarker-active:focus .tl-timemarker-line-left,
.tl-timemarker.tl-timemarker-active:focus .tl-timemarker-line-right {
  border-color: var(--color-dark);
}

.tl-timemarker.tl-timemarker-active:hover .tl-timemarker-line-left::after,
.tl-timemarker.tl-timemarker-active:hover .tl-timemarker-line-right::after,
.tl-timemarker.tl-timemarker-active:focus .tl-timemarker-line-left::after,
.tl-timemarker.tl-timemarker-active:focus .tl-timemarker-line-right::after {
  background-color: var(--color-dark);
}

/* Markers with End Dates */
.tl-timemarker.tl-timemarker-with-end .tl-timemarker-timespan .tl-timemarker-timespan-content {
  display: block;
}

.tl-timemarker.tl-timemarker-with-end .tl-timemarker-line-left,
.tl-timemarker.tl-timemarker-with-end .tl-timemarker-line-right {
  z-index: 5;
}

.tl-timemarker.tl-timemarker-with-end .tl-timemarker-timespan::after {
  display: block;
  content: " ";
  position: absolute;
  left: 0px;
  bottom: calc(-1 * var(--marker-dot-offset));
  height: 6px;
  width: 100%;
  background-color: rgba(127, 127, 127, 0.15); /* fadeout(darken(@ui-background-color, 50), 85%) */
  z-index: 6;
  border-radius: 7px;
}

.tl-timemarker.tl-timemarker-with-end .tl-timemarker-line-right {
  display: block;
}

.tl-timemarker.tl-timemarker-with-end .tl-timemarker-line-left {
  box-shadow: none;
}

.tl-timemarker.tl-timemarker-with-end .tl-timemarker-content-container.tl-timemarker-content-container-long {
  box-shadow: none;
}

/* End Date Hover */
.tl-timemarker.tl-timemarker-with-end:hover .tl-timemarker-timespan::after {
  background-color: rgba(12, 12, 12, 0.35); /* fadeout(darken(@ui-background-color, 100), 65%) */
}

/* End Date Active */
.tl-timemarker.tl-timemarker-with-end.tl-timemarker-active .tl-timemarker-timespan::after {
  background-color: rgba(51, 51, 51, 0.5); /* fadeout(@color-foreground, 50%) */
}

.tl-timemarker.tl-timemarker-with-end.tl-timemarker-active .tl-timemarker-line-left,
.tl-timemarker.tl-timemarker-with-end.tl-timemarker-active .tl-timemarker-line-right {
  border-width: 1px;
}

.tl-timemarker.tl-timemarker-with-end.tl-timemarker-active .tl-timemarker-line-left::after,
.tl-timemarker.tl-timemarker-with-end.tl-timemarker-active .tl-timemarker-line-right::after {
  background-color: var(--color-foreground) !important;
}

.tl-timemarker.tl-timemarker-with-end.tl-timemarker-active .tl-timemarker-line-left {
  box-shadow: none;
}

/* Icon Font Definitions */
.tl-icon-youtube::before { content: "\f167"; }
.tl-icon-vimeo::before { content: "\f27d"; }
.tl-icon-twitter::before { content: "\f099"; }
.tl-icon-wikipedia::before { content: "\f266"; }
.tl-icon-image::before { content: "\f03e"; }
.tl-icon-video::before { content: "\f03d"; }
.tl-icon-audio::before { content: "\f001"; }
.tl-icon-website::before { content: "\f0c1"; }
.tl-icon-default::before { content: "\f15c"; }
</style>

<script lang="ts" setup>
import type { Slide, TimelineEvent, TimeMarkerData, TimeMarkerOptions } from '../../../types'

const props = defineProps<{
  data?: Slide
  options?: TimeMarkerOptions
}>()
const emit = defineEmits<{
  (e: 'markerclick', payload: { unique_id: string }): void
  (e: 'markerfocus', payload: { unique_id: string }): void
  (e: 'markerblur', payload: { unique_id: string }): void
  (e: 'added'): void
}>()
const timelineStore = useTimelineStore()
const leftPosition = computed(() => props.data?.position)
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
  'tl-timemarker-with-end': !!props.data?.end_date,
  'tl-timemarker-active': isActive.value,
  'tl-timemarker-focused': isFocused.value,
  'tl-timemarker-fast': isFast.value,
}))

const contentContainerClasses = computed(() => ({
  'tl-timemarker-content-container-small': height.value < 56,
  'tl-timemarker-content-container-long': props.data?.end_date && width.value > props.options?.marker_width_min,
}))

const contentClasses = computed(() => ({
  'tl-timemarker-content-small': height.value <= 30,
}))

const headlineClasses = computed(() => ({
  'tl-headline-fadeout': shouldShowFadeout.value,
}))

const ariaLabel = computed(() => {
  const dateText = props.data?.start_date?.format(props.data.start_date_format)
  const label = `${props.data?.text?.headline}, ${dateText}`
  if (isActive.value) {
    return `${label}, shown`
  }
  return `${label}, press space to show`
})

const markerStyle = computed(() => ({
  position: 'absolute' as const,
  minHeight: `${props.options?.marker_height_min}px`,
  minWidth: `${props.options?.marker_width_min}px`,
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
  if (!props.data?.media || !props.data?.media.url) {
    return 'default'
  }

  const url = props.data?.media.url.toLowerCase()
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
</script>

<template>
  <div
    ref="markerEl"
    class="absolute"
    tabindex="-1"
    role="button"
    :style="{ left: `${props.data?.position}px` }"
  >
    <!-- Timespan -->
    <div class="pointer-events-none absolute m-0 w-[100%] h-[100%] bg-[rgba(235,235,235,0.15)] border-t---time-marker-border-radius border-t---time-marker-border-radius transition-all duration---animation-duration-fast ease---animation-ease">
      <!-- Timespan Content (only for end dates) -->
      <div
        class="hidden absolute w-[100%] bg-[var(--marker-color)] border-t-[var(--time-marker-border-radius)] border-t-[var(--time-marker-border-radius)] h-[100px] box-border"
      />

      <!-- Line Left -->
      <div class="w-[1px] left-[0px] mt-[var(--marker-dot-offset)] box-border border-l-[1px] border-l-solid border-l-[var(--marker-outline-color)] z-5 content-[] absolute h-full shadow-xs" />

      <!-- Line Right (only for end dates) -->
      <div
        class="hidden right-[0px] w-[1px] mt-[var(--marker-dot-offset)] box-border border-l-[1px] border-l-solid border-l-[var(--marker-outline-color)] z-5 content-[] absolute h-[100%] shadow-[1px_1px_1px_var(--color-background)]"
      />
    </div>

    <!-- Content Container -->
    <div
      ref="contentEl"
      class="tl-timemarker-content-container"
    >
      <!-- Content -->
      <div
        class="tl-timemarker-content"
      >
        <!-- Media Container -->
        <div
          class="tl-timemarker-media-container"
        >
          <!-- Media Thumbnail -->
          <img
            class="tl-timemarker-media"
            alt="props.data.media.caption || ''"
          >
          <!-- Media Icon -->
          <span
            class="block"
          />
        </div>

        <!-- Text Content -->
        <div class="tl-timemarker-text">
          <h2
            ref="headlineEl"
            class="tl-headline"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

<script lang="ts" setup>
import type { Slide } from '../types'
import moment from 'moment'
import { computed, ref } from 'vue'

// Props
const props = defineProps<{
  slide: Slide
  active: boolean
}>()

const visible = ref(false)

// Computed property for formatted date
const formattedDate = computed(() => {
  if (props.slide.data.start_date) {
    // Since the data is already processed by TimelineConfig, start_date should be a moment object
    if (moment.isMoment(props.slide.data.start_date)) {
      // Check if there's a custom display date
      const displayDate = (props.slide.data.start_date as any)._displayDate
      if (displayDate) {
        return displayDate
      }

      // Format the date including time if available
      if (props.slide.data.start_date.hour() !== 0 || props.slide.data.start_date.minute() !== 0) {
        return props.slide.data.start_date.format('MMMM D, YYYY [at] h:mm A')
      }

      return props.slide.data.start_date.format('MMMM D, YYYY')
    }
  }
  return null
})

// Expose visibility state
defineExpose({
  visible,
})
</script>

<template>
  <div
    class="tl-slide"
    :class="{ 'tl-slide-active': active }"
  >
    <div class="tl-slide-content">
      <div
        v-if="formattedDate"
        class="tl-date"
      >
        {{ formattedDate }}
      </div>
      <h2 v-if="slide.data.text?.headline">
        {{ slide.data.text.headline }}
      </h2>
      <div
        v-if="slide.data.text?.text"
        v-html="slide.data.text.text"
      />
      <div
        v-if="slide.data.media?.url"
        class="tl-media"
      >
        <img
          :src="slide.data.media.url"
          :alt="slide.data.media.caption || ''"
        >
        <div
          v-if="slide.data.media.caption"
          class="tl-caption"
        >
          {{ slide.data.media.caption }}
        </div>
        <div
          v-if="slide.data.media.credit"
          class="tl-credit"
        >
          {{ slide.data.media.credit }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tl-slide {
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.5s ease;
  overflow-y: auto;
  visibility: hidden;
}

.tl-slide-active {
  opacity: 1;
  z-index: 10;
  visibility: visible;
}

.tl-slide-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.tl-date {
  font-size: 1.1em;
  color: #0066cc;
  font-weight: 600;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
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

.tl-credit {
  font-size: 0.8em;
  margin-top: 4px;
  color: #888;
}
</style>

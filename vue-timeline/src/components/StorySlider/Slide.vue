<script lang="ts" setup>
import type { Slide } from '../../types'
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

<style >
</style>

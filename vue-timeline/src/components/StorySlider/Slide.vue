<script lang="ts" setup>
import type { Slide } from '../../types'
import moment from 'moment'
import { computed, ref } from 'vue'

// Props
const props = defineProps<{
  slide: Slide
  active: boolean
}>()

// Template refs
const slideContainerEl = ref<HTMLDivElement | null>(null)
const scrollContainerEl = ref<HTMLDivElement | null>(null)
const backgroundEl = ref<HTMLDivElement | null>(null)
const contentContainerEl = ref<HTMLDivElement | null>(null)
const contentEl = ref<HTMLDivElement | null>(null)

const visible = ref(true)

// Computed properties for slide layout detection
const hasMedia = computed(() => Boolean(props.slide.data.media?.url))
const hasText = computed(() => Boolean(props.slide.data.text?.text))
const hasHeadline = computed(() => Boolean(props.slide.data.text?.headline))
const isTitle = computed(() => props.slide.data.unique_id?.includes('title') || false)

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

// Computed classes for dynamic styling
const slideClasses = computed(() => {
  const classes = ['tl-slide']

  if (isTitle.value) {
    classes.push('tl-slide-titleslide')
  }

  if (props.slide.data.background?.url) {
    classes.push('tl-full-image-background')
  }

  if (props.slide.data.background?.color) {
    classes.push('tl-full-color-background')
  }

  if (props.slide.data.background?.text_background) {
    classes.push('tl-text-background')
  }

  // Layout classes based on content
  if (!hasText.value && !hasHeadline.value && hasMedia.value) {
    classes.push('tl-slide-media-only')
  }
  else if (hasHeadline.value && hasMedia.value && !hasText.value) {
    classes.push('tl-slide-media-only')
  }
  else if ((hasText.value || hasHeadline.value) && !hasMedia.value) {
    classes.push('tl-slide-text-only')
  }

  return classes
})

// Background style computed property
const backgroundStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.slide.data.background?.url) {
    style.backgroundImage = `url('${props.slide.data.background.url}')`
    style.display = 'block'
  }

  if (props.slide.data.background?.color) {
    style.backgroundColor = props.slide.data.background.color
  }

  return style
})

// Expose visibility state
defineExpose({
  visible,
})
</script>

<template>
  <!-- .tl-slide - Main slide container -->
  <div
    :id="slide.data.unique_id"
    ref="slideContainerEl"
    :class="slideClasses"
    class="absolute w-full h-full p-0 m-0 overflow-x-hidden overflow-y-auto"
  >
    <!-- .tl-slide-background - Background container -->
    <div
      ref="backgroundEl"
      class="tl-slide-background absolute left-0 top-0 w-full h-full -z-1 overflow-hidden opacity-50 bg-no-repeat bg-center bg-cover"
      :style="backgroundStyle"
      :role="slide.data.background?.alt ? 'img' : undefined"
      :aria-label="slide.data.background?.alt"
    />

    <!-- .tl-slide-scrollable-container -->
    <div
      ref="scrollContainerEl"
      class="tl-slide-scrollable-container table table-fixed h-full z-1"
    >
      <!-- .tl-slide-content-container -->
      <div
        ref="contentContainerEl"
        class="tl-slide-content-container table-cell align-middle relative w-full h-full z-3"
      >
        <!-- .tl-slide-content -->
        <div
          ref="contentEl"
          class="tl-slide-content table align-middle relative max-w-full select-text box-content pl-25 pr-25"
          style="direction: rtl;"
        >
          <!-- .tl-text - Text content -->
          <div
            v-if="hasText || hasHeadline"
            class="tl-text w-1/2 max-w-1/2 min-w-30 px-5 table-cell align-middle text-left"
            style="direction: ltr;"
          >
            <div class="tl-text-content-container">
              <!-- Date display -->
              <div
                v-if="formattedDate && !isTitle"
                class="tl-date-display text-sm opacity-70 mb-2"
              >
                {{ formattedDate }}
              </div>

              <!-- Headline -->
              <h2
                v-if="hasHeadline"
                class="tl-headline text-2xl font-bold mb-4"
              >
                {{ slide.data.text?.headline }}
              </h2>

              <!-- Text content -->
              <div
                v-if="hasText"
                class="tl-text-content"
                v-html="slide.data.text?.text"
              />
            </div>
          </div>

          <!-- .tl-media - Media content -->
          <div
            v-if="hasMedia"
            class="tl-media relative w-full min-w-1/2 float-left my-auto"
            style="direction: ltr;"
          >
            <img
              :src="slide.data.media?.url"
              :alt="slide.data.media?.caption || ''"
              class="max-w-full h-auto"
            >

            <!-- Media caption -->
            <div
              v-if="slide.data.media?.caption"
              class="tl-caption text-sm mt-2 opacity-80"
            >
              {{ slide.data.media.caption }}
            </div>

            <!-- Media credit -->
            <div
              v-if="slide.data.media?.credit"
              class="tl-credit text-xs mt-1 opacity-60"
            >
              {{ slide.data.media.credit }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Slide Styles - Based on TL.Slide.less */

.tl-slide {
  box-sizing: content-box;
}

/* Only Media (no text) layout */
.tl-slide-media-only {
  & .tl-slide-content-container {
    & .tl-slide-content {
      text-align: center;

      & .tl-media {
        text-align: center;
        width: 100%;
        min-width: 50%;
        max-width: 100%;
        float: none;
        margin: auto;
      }

      & .tl-text {
        width: 100%;
        max-width: 100%;
        display: block;
        margin: auto;
        text-align: center;
      }
    }
  }
}

/* Only Text (no media) layout */
.tl-slide-text-only {
  & .tl-slide-content-container {
    & .tl-slide-content {
      text-align: center;

      & .tl-text {
        max-width: 80%;
        width: 80%;
        display: block;
        margin: auto;
      }
    }
  }
}

/* Background image and color styles */
.tl-slide.tl-full-image-background,
.tl-slide.tl-full-color-background {
  text-shadow: 1px 1px 2px #000;

  & p, & h1, & h2, & h3, & h4, & h5, & h6 {
    text-shadow: 1px 1px 2px #000;
  }

  & a, & b, & i, & blockquote, & blockquote p {
    text-shadow: 1px 1px 1px #000;
    color: #f0f0f0;
  }

  & a:hover {
    text-decoration: underline;
    color: #3498db;
  }

  & .tl-caption, & .tl-credit {
    text-shadow: 1px 1px 2px #000;
  }
}

/* Full Image Background */
.tl-slide.tl-full-image-background {
  background: no-repeat center center;
  background-size: cover;
  background-position: center 25%;
}

/* Text Background */
.tl-slide.tl-text-background {
  & .tl-text {
    & .tl-text-content-container {
      padding: 20px;
      background-color: rgba(0, 0, 0, 0.6);
      border-radius: 7px;

      & h2 {
        margin-top: 5px;
      }
    }
  }
}

/* Skinny layout - responsive design */
.tl-skinny .tl-slide {
  display: block;
  padding-top: 10px;

  & .tl-slide-content-container {
    display: block;
    position: static;
    height: 100%;
    display: flex;
    align-items: center;

    & .tl-slide-content {
      display: block;
      display: flex;
      flex-direction: column;
      position: static;
      height: auto;
      padding-left: 50px;
      padding-right: 50px;

      & .tl-media {
        width: 100%;
        height: auto;
        float: none;
        display: block;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
      }

      & .tl-text {
        display: block;
        height: auto;
        position: static;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        float: none;
        padding: 0;

        & .tl-text-content-container {
          padding: 10px;
          padding-bottom: 10px;
        }
      }
    }
  }

  &.tl-slide-media-only {
    & .tl-slide-content-container {
      & .tl-slide-content {
        flex-direction: column;

        & .tl-media {
          border-top: none;
          padding-top: 0;
        }
      }
    }
  }
}

/* Mobile responsive styles */
.tl-mobile.tl-skinny .tl-slide {
  & .tl-slide-content-container {
    & .tl-slide-content {
      & .tl-media {
        & img, & embed, & object, & video, & iframe {
          max-height: 175px;
        }
      }
    }
  }
}
</style>

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
const hasMedia = computed(() => Boolean(props.slide.media?.url))
const hasText = computed(() => Boolean(props.slide.text?.text))
const hasHeadline = computed(() => Boolean(props.slide.text?.headline))
const isTitle = computed(() => props.slide.isTitle)

// Computed property for formatted date
const formattedDate = computed(() => {
  if (props.slide.start_date) {
    // Since the data is already processed by TimelineConfig, start_date should be a moment object
    if (moment.isMoment(props.slide.start_date)) {
      // Check if there's a custom display date
      const displayDate = (props.slide.start_date as any)._displayDate
      if (displayDate) {
        return displayDate
      }

      return props.slide.start_date.format(props.slide.start_date_format)
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

  if (props.slide.background?.url) {
    classes.push('tl-full-image-background')
  }

  if (props.slide.background?.color) {
    classes.push('tl-full-color-background')
  }

  if (props.slide.background?.text) {
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

  if (props.slide.background?.url) {
    style.backgroundImage = `url('${props.slide.background.url}')`
    style.display = 'block'
  }

  if (props.slide.background?.color) {
    style.backgroundColor = props.slide.background.color
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
    :id="slide.unique_id"
    ref="slideContainerEl"
    :class="slideClasses"
    class="absolute w-full h-full p-0 m-0 overflow-x-hidden overflow-y-auto"
  >
    <!-- .tl-slide-background - Background container -->
    <div
      ref="backgroundEl"
      class="tl-slide-background absolute left-0 top-0 w-full h-full -z-1 overflow-hidden opacity-50 bg-no-repeat bg-center bg-cover"
      :style="backgroundStyle"
      :role="slide.background?.alt ? 'img' : undefined"
      :aria-label="slide.background?.alt"
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
                {{ slide.text?.headline }}
              </h2>

              <!-- Text content -->
              <div
                v-if="hasText"
                class="tl-text-content"
                v-html="slide.text?.text"
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
              :src="slide.media?.url"
              :alt="slide.media?.caption || ''"
              class="max-w-full h-auto"
            >

            <!-- Media caption -->
            <div
              v-if="slide.media?.caption"
              class="tl-caption text-sm mt-2 opacity-80"
            >
              {{ slide.media.caption }}
            </div>

            <!-- Media credit -->
            <div
              v-if="slide.media?.credit"
              class="tl-credit text-xs mt-1 opacity-60"
            >
              {{ slide.media.credit }}
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
  @apply box-content;
}
/* Only Media (no text) layout */
.tl-slide-media-only {
  & .tl-slide-content-container {
    & .tl-slide-content {
      @apply text-center;
      & .tl-media {
        @apply text-center w-full min-w-50 max-w-full;
        float: none;
        margin: auto;
      }
      & .tl-text {
        @apply w-full min-w-50 max-w-full text-center m-auto;
      }
    }
  }
}
/* Only Text (no media) layout */
.tl-slide-text-only {
  & .tl-slide-content-container {
    & .tl-slide-content {
      @apply text-center;
      & .tl-text {
        @apply max-w-80 w-80 block m-auto;
      }
    }
  }
}
/* Background image and color styles */
.tl-slide.tl-full-image-background,
.tl-slide.tl-full-color-background {
  @apply shadow;
  & p, & h1, & h2, & h3, & h4, & h5, & h6 {
    @apply text-shadow-sm;
  }
  & a, & b, & i, & blockquote, & blockquote p {
    @apply text-shadow-sm text-gray-200;
  }
  & a {
    @apply hover:underline hover:text-teal-700
  }
  & .tl-caption, & .tl-credit {
    @apply text-shadow-sm;
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
      @apply p-20px bg-[rgba(0,0,0,0.6)] border-rd-7px;
      & h2 {
        @apply m-t-3;
      }
    }
  }
}
/* Skinny layout - responsive design */
.tl-skinny .tl-slide {
  @apply block p-t-6;
  & .tl-slide-content-container {
    @apply block static h-full flex items-center;
    & .tl-slide-content {
      @apply block flex-col static px-6;
      & .tl-media {
        @apply w-full h-auto float-none block pt-20px b-t-1px b-t-solid b-t-#e0e0e0
      }
      & .tl-text {
        @apply block h-auto static w-full max-w-full min-w-0 float-none p-0;
        & .tl-text-content-container {
          @apply p-10px pb-10px;
        }
      }
    }
  }
  &.tl-slide-media-only {
    & .tl-slide-content-container {
      & .tl-slide-content {
        @apply flex-col;
        & .tl-media {
          @apply border-t-0 pt-0;
        }
      }
    }
  }
}
/* Mobile responsive styles */
.tl-mobile.tl-skinny {
  & .tl-slide {
  & .tl-slide-content-container {
    & .tl-slide-content {
      & .tl-media {
        & img, & embed, & object, & video, & iframe {
          @apply max-h-175px;
        }
      }
    }
  }
}
}
</style>

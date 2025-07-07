<template>
  <div class="tl-slide" :class="{ 'tl-slide-active': active }">
    <div class="tl-slide-content">
      <h2 v-if="slide.data.text?.headline">{{ slide.data.text.headline }}</h2>
      <div v-if="slide.data.text?.text" v-html="slide.data.text.text"></div>
      <div v-if="slide.data.media?.url" class="tl-media">
        <img :src="slide.data.media.url" :alt="slide.data.media.caption || ''" />
        <div v-if="slide.data.media.caption" class="tl-caption">
          {{ slide.data.media.caption }}
        </div>
        <div v-if="slide.data.media.credit" class="tl-credit">
          {{ slide.data.media.credit }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { Slide } from '../types'

// Props
defineProps<{
  slide: Slide
  active: boolean
}>()

const visible = ref(false)

// Expose visibility state
defineExpose({
  visible
})
</script>

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

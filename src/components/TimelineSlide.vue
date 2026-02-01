<template>
  <div 
    class="timeline-slide"
    :class="slideClasses"
    @click="$emit('click')"
  >
    <div class="slide-background" :style="backgroundStyle"></div>
    
    <div class="slide-content">
      <div class="slide-text">
        <h2 v-if="data.text?.headline" class="slide-headline">
          {{ data.text.headline }}
        </h2>
        <div 
          v-if="data.text?.text" 
          class="slide-text-content"
          v-html="sanitizedText"
        ></div>
      </div>
      
      <div v-if="data.media?.url" class="slide-media">
        <TimelineMedia
          :media="data.media"
          @loaded="$emit('media-loaded')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'
import TimelineMedia from './TimelineMedia.vue'
import type { TimelineEvent, TimelineTitle } from '@/types/timeline'

interface Props {
  data: TimelineEvent | TimelineTitle
  isTitle: boolean
  isActive: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'click': []
  'media-loaded': []
}>()

const slideClasses = computed(() => ({
  'slide-title': props.isTitle,
  'slide-event': !props.isTitle,
  'slide-active': props.isActive
}))

const backgroundStyle = computed(() => {
  const bg = (props.data as any).background
  if (!bg) return {}
  
  return {
    backgroundColor: bg.color || 'transparent',
    backgroundImage: bg.url ? `url(${bg.url})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})

const sanitizedText = computed(() => {
  if (!props.data.text?.text) return ''
  return DOMPurify.sanitize(props.data.text.text)
})
</script>

<style lang="scss" scoped>
.timeline-slide {
  min-width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .slide-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.3;
    z-index: 0;
  }
  
  .slide-content {
    position: relative;
    z-index: 1;
    max-width: 800px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .slide-text {
    margin-bottom: 20px;
    
    .slide-headline {
      font-size: 2em;
      margin: 0 0 16px;
      color: #333;
    }
    
    .slide-text-content {
      font-size: 1.1em;
      line-height: 1.6;
      color: #666;
    }
  }
  
  .slide-media {
    margin-top: 20px;
  }
  
  &.slide-title {
    .slide-headline {
      font-size: 3em;
      text-align: center;
    }
  }
}
</style>

<template>
  <div 
    class="min-w-full h-full relative flex items-center justify-center"
    :class="slideClasses"
    @click="$emit('click')"
  >
    <div class="absolute top-0 left-0 right-0 bottom-0 opacity-30 z-0" :style="backgroundStyle"></div>
    
    <div class="relative z-1 max-w-800px p-10 bg-white/95 rounded-lg shadow-lg">
      <div class="mb-5">
        <h2 v-if="data.text?.headline" class="text-2em m-0 mb-4 text-#333" :class="{ 'text-3em text-center': isTitle }">
          {{ data.text.headline }}
        </h2>
        <div 
          v-if="data.text?.text" 
          class="text-1.1em leading-1.6 text-#666"
          v-html="sanitizedText"
        ></div>
      </div>
      
      <div v-if="data.media?.url" class="mt-5">
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


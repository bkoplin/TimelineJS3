<template>
  <div class="w-full">
    <img 
      v-if="isImage"
      :src="media.url"
      :alt="media.alt || media.caption || ''"
      @load="$emit('loaded')"
      @error="handleError"
      class="max-w-full h-auto rounded"
    />
    
    <div v-else-if="isVideo" class="relative pb-56.25% h-0 overflow-hidden">
      <iframe
        :src="videoEmbedUrl"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        @load="$emit('loaded')"
        class="absolute top-0 left-0 w-full h-full"
      ></iframe>
    </div>
    
    <div v-else class="p-10 text-center bg-#f5f5f5 rounded">
      <i class="fa fa-file text-48px text-#ccc mb-4"></i>
      <a v-if="media.url" :href="media.url" target="_blank" class="text-#c34528 no-underline hover:underline">View Media</a>
    </div>
    
    <div v-if="media.caption || media.credit" class="mt-3 text-0.9em">
      <p v-if="media.caption" class="my-1 text-#666">{{ media.caption }}</p>
      <p v-if="media.credit" class="my-1 text-#999 italic">{{ media.credit }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TimelineMedia } from '@/types/timeline'

interface Props {
  media: TimelineMedia
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'loaded': []
  'error': []
}>()

const isImage = computed(() => {
  if (!props.media.url) return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  return imageExtensions.some(ext => props.media.url!.toLowerCase().endsWith(ext))
})

const isVideo = computed(() => {
  if (!props.media.url) return false
  return props.media.url.includes('youtube.com') || 
         props.media.url.includes('youtu.be') ||
         props.media.url.includes('vimeo.com')
})

const videoEmbedUrl = computed(() => {
  if (!props.media.url) return ''
  
  // YouTube
  if (props.media.url.includes('youtube.com') || props.media.url.includes('youtu.be')) {
    const videoId = extractYouTubeId(props.media.url)
    return `https://www.youtube.com/embed/${videoId}`
  }
  
  // Vimeo
  if (props.media.url.includes('vimeo.com')) {
    const videoId = props.media.url.split('/').pop()
    return `https://player.vimeo.com/video/${videoId}`
  }
  
  return props.media.url
})

function extractYouTubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : ''
}

function handleError() {
  emit('error')
}
</script>


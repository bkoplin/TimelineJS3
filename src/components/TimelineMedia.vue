<template>
  <div class="timeline-media">
    <img 
      v-if="isImage"
      :src="media.url"
      :alt="media.alt || media.caption || ''"
      @load="$emit('loaded')"
      @error="handleError"
    />
    
    <div v-else-if="isVideo" class="media-video">
      <iframe
        :src="videoEmbedUrl"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        @load="$emit('loaded')"
      ></iframe>
    </div>
    
    <div v-else class="media-placeholder">
      <i class="fa fa-file"></i>
      <a v-if="media.url" :href="media.url" target="_blank">View Media</a>
    </div>
    
    <div v-if="media.caption || media.credit" class="media-caption">
      <p v-if="media.caption" class="caption-text">{{ media.caption }}</p>
      <p v-if="media.credit" class="caption-credit">{{ media.credit }}</p>
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

<style lang="scss" scoped>
.timeline-media {
  width: 100%;
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }
  
  .media-video {
    position: relative;
    padding-bottom: 56.25%; // 16:9 aspect ratio
    height: 0;
    overflow: hidden;
    
    iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
  
  .media-placeholder {
    padding: 40px;
    text-align: center;
    background-color: #f5f5f5;
    border-radius: 4px;
    
    i {
      font-size: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }
    
    a {
      color: #c34528;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .media-caption {
    margin-top: 12px;
    font-size: 0.9em;
    
    .caption-text {
      margin: 4px 0;
      color: #666;
    }
    
    .caption-credit {
      margin: 4px 0;
      color: #999;
      font-style: italic;
    }
  }
}
</style>

<template>
  <div class="w-full bg-#f5f5f5 border-b border-#ddd flex items-center px-2.5" :style="menubarStyle">
    <div class="flex gap-2">
      <button 
        class="bg-white border border-#ccc rounded px-2 py-1 cursor-pointer transition-all duration-200 hover:bg-#e0e0e0" 
        @click="$emit('zoom-in')"
        :title="'Zoom In'"
      >
        <component :is="iconProvider?.iconRenderers.value.zoomIn()" class="text-14px" />
      </button>
      <button 
        class="bg-white border border-#ccc rounded px-2 py-1 cursor-pointer transition-all duration-200 hover:bg-#e0e0e0" 
        @click="$emit('zoom-out')"
        :title="'Zoom Out'"
      >
        <component :is="iconProvider?.iconRenderers.value.zoomOut()" class="text-14px" />
      </button>
      <button 
        class="bg-white border border-#ccc rounded px-2 py-1 cursor-pointer transition-all duration-200 hover:bg-#e0e0e0" 
        @click="$emit('go-to-start')"
        :title="'Go to Start'"
      >
        <component :is="iconProvider?.iconRenderers.value.goToStart()" class="text-14px" />
      </button>
      <button 
        class="bg-white border border-#ccc rounded px-2 py-1 cursor-pointer transition-all duration-200 hover:bg-#e0e0e0" 
        @click="$emit('go-to-end')"
        :title="'Go to End'"
      >
        <component :is="iconProvider?.iconRenderers.value.goToEnd()" class="text-14px" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { TimelineOptions } from '@/types/timeline'

const emit = defineEmits<{
  'zoom-in': []
  'zoom-out': []
  'go-to-start': []
  'go-to-end': []
}>()

const options = inject<TimelineOptions>('timeline-options', {} as TimelineOptions)
const iconProvider = inject<any>('iconProvider')

const menubarStyle = computed(() => ({
  height: `${options.menubar_height || 30}px`
}))
</script>


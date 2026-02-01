<template>
  <div class="timeline-menubar" :style="menubarStyle">
    <div class="menubar-buttons">
      <button 
        class="tl-menubar-button" 
        @click="$emit('zoom-in')"
        :title="'Zoom In'"
      >
        <component :is="iconProvider?.iconRenderers.value.zoomIn()" />
      </button>
      <button 
        class="tl-menubar-button" 
        @click="$emit('zoom-out')"
        :title="'Zoom Out'"
      >
        <component :is="iconProvider?.iconRenderers.value.zoomOut()" />
      </button>
      <button 
        class="tl-menubar-button" 
        @click="$emit('go-to-start')"
        :title="'Go to Start'"
      >
        <component :is="iconProvider?.iconRenderers.value.goToStart()" />
      </button>
      <button 
        class="tl-menubar-button" 
        @click="$emit('go-to-end')"
        :title="'Go to End'"
      >
        <component :is="iconProvider?.iconRenderers.value.goToEnd()" />
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

<style lang="scss" scoped>
.timeline-menubar {
  width: 100%;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  padding: 0 10px;
  
  .menubar-buttons {
    display: flex;
    gap: 8px;
  }
  
  .tl-menubar-button {
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: #e0e0e0;
    }
    
    i {
      font-size: 14px;
    }
  }
}
</style>

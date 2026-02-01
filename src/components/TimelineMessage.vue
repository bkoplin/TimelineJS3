<template>
  <div class="timeline-message">
    <div class="message-content">
      <component 
        v-if="type === 'loading'" 
        :is="iconProvider?.iconRenderers.value.loading()" 
      />
      <component 
        v-else-if="type === 'error'" 
        :is="iconProvider?.iconRenderers.value.error()" 
      />
      <component 
        v-else-if="type === 'info'" 
        :is="iconProvider?.iconRenderers.value.info()" 
      />
      <span>{{ message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

interface Props {
  message: string
  type?: 'loading' | 'error' | 'info'
}

withDefaults(defineProps<Props>(), {
  type: 'loading'
})

const iconProvider = inject<any>('iconProvider')
</script>

<style lang="scss" scoped>
.timeline-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  
  .message-content {
    background: rgba(255, 255, 255, 0.95);
    padding: 20px 30px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 16px;
    
    i {
      font-size: 20px;
      color: #666;
    }
  }
}
</style>

<template>
  <div class="timeline-message">
    <div class="message-content">
      <i v-if="type === 'loading'" class="fa fa-spinner fa-spin"></i>
      <i v-else-if="type === 'error'" class="fa fa-exclamation-circle"></i>
      <i v-else-if="type === 'info'" class="fa fa-info-circle"></i>
      <span>{{ message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message: string
  type?: 'loading' | 'error' | 'info'
}

withDefaults(defineProps<Props>(), {
  type: 'loading'
})
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

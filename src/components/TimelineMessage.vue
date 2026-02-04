<template>
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-1000">
    <div class="bg-white/95 px-7.5 py-5 rounded-lg shadow-lg flex items-center gap-3 text-16px">
      <component 
        v-if="type === 'loading'" 
        :is="iconProvider?.iconRenderers.value.loading()" 
        class="text-20px text-#666"
      />
      <component 
        v-else-if="type === 'error'" 
        :is="iconProvider?.iconRenderers.value.error()" 
        class="text-20px text-#666"
      />
      <component 
        v-else-if="type === 'info'" 
        :is="iconProvider?.iconRenderers.value.info()" 
        class="text-20px text-#666"
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


<template>
  <div class="w-full h-full bg-#f5f5f5 flex flex-col relative">
    <!-- Menu Bar Skeleton -->
    <div class="h-60px bg-white border-b border-#e0e0e0 flex items-center gap-3 px-5">
      <div class="skeleton-shimmer w-40px h-40px rounded"></div>
      <div class="skeleton-shimmer w-40px h-40px rounded"></div>
      <div class="skeleton-shimmer w-40px h-40px rounded"></div>
      <div class="skeleton-shimmer w-40px h-40px rounded"></div>
    </div>

    <!-- Main Content Skeleton -->
    <div class="flex-1 flex items-center justify-center p-10">
      <!-- Slide Skeleton -->
      <div class="max-w-3xl w-full flex gap-7.5 md:flex-col">
        <div class="skeleton-shimmer w-400px h-300px rounded-lg flex-shrink-0 md:w-full md:h-200px"></div>
        <div class="flex-1 flex flex-col gap-3">
          <div class="skeleton-shimmer w-80% h-32px rounded"></div>
          <div class="skeleton-shimmer w-full h-16px rounded"></div>
          <div class="skeleton-shimmer w-60% h-16px rounded"></div>
        </div>
      </div>
    </div>

    <!-- Navigation Skeleton -->
    <div class="h-200px bg-white border-t border-#e0e0e0 p-5 relative">
      <div class="skeleton-shimmer w-full h-4px rounded-sm mt-10"></div>
      <div class="relative h-60px mt-2.5">
        <div v-for="i in markerCount" :key="i" 
             class="skeleton-shimmer absolute w-12px h-12px rounded-full -translate-x-1/2"
             :style="{ left: `${(i / markerCount) * 100}%` }">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  markerCount?: number
}>()

const markerCount = computed(() => props.markerCount || 5)
</script>

<style scoped>
/* Skeleton Animation */
@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes skeleton-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    #e0e0e0 25%,
    #f0f0f0 50%,
    #e0e0e0 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer {
    animation: skeleton-pulse 2s infinite;
  }
}
</style>

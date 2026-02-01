<template>
  <div class="timeline-skeleton">
    <!-- Menu Bar Skeleton -->
    <div class="skeleton-menubar">
      <div class="skeleton-button"></div>
      <div class="skeleton-button"></div>
      <div class="skeleton-button"></div>
      <div class="skeleton-button"></div>
    </div>

    <!-- Main Content Skeleton -->
    <div class="skeleton-content">
      <!-- Slide Skeleton -->
      <div class="skeleton-slide">
        <div class="skeleton-media"></div>
        <div class="skeleton-text">
          <div class="skeleton-headline"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    </div>

    <!-- Navigation Skeleton -->
    <div class="skeleton-navigation">
      <div class="skeleton-timeline-bar"></div>
      <div class="skeleton-markers">
        <div v-for="i in markerCount" :key="i" 
             class="skeleton-marker"
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

<style scoped lang="scss">
.timeline-skeleton {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  position: relative;
}

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

.skeleton-menubar {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
}

.skeleton-button {
  width: 40px;
  height: 40px;
  background: linear-gradient(
    90deg,
    #e0e0e0 25%,
    #f0f0f0 50%,
    #e0e0e0 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.skeleton-slide {
  max-width: 800px;
  width: 100%;
  display: flex;
  gap: 30px;
}

.skeleton-media {
  width: 400px;
  height: 300px;
  background: linear-gradient(
    90deg,
    #e0e0e0 25%,
    #f0f0f0 50%,
    #e0e0e0 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 8px;
  flex-shrink: 0;
}

.skeleton-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-headline {
  width: 80%;
  height: 32px;
  background: linear-gradient(
    90deg,
    #e0e0e0 25%,
    #f0f0f0 50%,
    #e0e0e0 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-line {
  width: 100%;
  height: 16px;
  background: linear-gradient(
    90deg,
    #e0e0e0 25%,
    #f0f0f0 50%,
    #e0e0e0 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;

  &.short {
    width: 60%;
  }
}

.skeleton-navigation {
  height: 200px;
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 20px;
  position: relative;
}

.skeleton-timeline-bar {
  width: 100%;
  height: 4px;
  background: linear-gradient(
    90deg,
    #e0e0e0 25%,
    #f0f0f0 50%,
    #e0e0e0 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 2px;
  margin-top: 40px;
}

.skeleton-markers {
  position: relative;
  height: 60px;
  margin-top: 10px;
}

.skeleton-marker {
  position: absolute;
  width: 12px;
  height: 12px;
  background: linear-gradient(
    90deg,
    #e0e0e0 25%,
    #f0f0f0 50%,
    #e0e0e0 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 50%;
  transform: translateX(-50%);
}

/* Responsive */
@media (max-width: 768px) {
  .skeleton-slide {
    flex-direction: column;
  }

  .skeleton-media {
    width: 100%;
    height: 200px;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .skeleton-button,
  .skeleton-media,
  .skeleton-headline,
  .skeleton-line,
  .skeleton-timeline-bar,
  .skeleton-marker {
    animation: skeleton-pulse 2s infinite;
  }
}
</style>

<script lang="ts" setup>
import { byPrefixAndName } from '@awesome.me/kit-fbc16e12c7/icons'
import { useEventBus } from '@vueuse/core'

const zoomInButton = ref<HTMLButtonElement | null>(null)
const zoomOutButton = ref<HTMLButtonElement | null>(null)
const timelineStore = useTimelineStore()
// Event handlers
</script>

<template>
  <!-- .tl-menubar -->
  <div
    class="absolute z-11 bottom-0 left-0"
    :style="{ height: `${timelineStore.timeNavHeight}px` }"
  >
    <div
      class="flex flex-col justify-center h-full items-stretch"
    >
      <!-- .tl-menubar-button -->
      <ElButton
        ref="zoomInButton"
        size="small"
        tag="div"
        plain
        :disabled="timelineStore.zoomStepper.isLast"
        @click="timelineStore.zoomStepper.goToNext()"
      >
        <template #icon>
          <FontAwesomeIcon :icon="byPrefixAndName.fas['magnifying-glass-plus']" />
        </template>
      </ElButton>
      <!-- .tl-menubar-button -->
      <ElButton
        ref="zoomOutButton"
        size="small"
        tag="div"
        plain
        :disabled="timelineStore.zoomStepper.isFirst"
        @click="timelineStore.zoomStepper.goToPrevious()"
      >
        <template #icon>
          <FontAwesomeIcon :icon="byPrefixAndName.fas['magnifying-glass-minus']" />
        </template>
      </ElButton>
      <!-- .tl-menubar-button -->
      <ElButton
        :disabled="timelineStore.isFirst"
        tag="div"
        size="small"
        plain
        @click="timelineStore.index = timelineStore.hasTitle ? 1 : 0"
      >
        <template #icon>
          <FontAwesomeIcon :icon="byPrefixAndName.fas['arrow-left-long-to-line']" />
        </template>
      </ElButton>
      <!-- .tl-menubar-button -->
      <ElButton
        :disabled="timelineStore.isLast"
        tag="div"
        size="small"
        plain
        @click="timelineStore.goTo(timelineStore.stepNames[timelineStore.stepNames.length - 1])"
      >
        <template #icon>
          <FontAwesomeIcon :icon="byPrefixAndName.fas['arrow-right-long-to-line']" />
        </template>
      </ElButton>
    </div>
  </div>
</template>

<style scoped>
</style>

<script lang="ts" setup>
import { byPrefixAndName } from '@awesome.me/kit-fbc16e12c7/icons'
import { useEventBus } from '@vueuse/core'

// Define props and emits
const props = defineProps<{
  options: any
  language: any
}>()

const emit = defineEmits<{
  (e: 'zoom_in', payload: any): void
  (e: 'zoom_out', payload: any): void
  (e: 'back_to_start', payload: any): void
  (e: 'forward_to_end', payload: any): void
}>()

// Setup reactive refs
const zoomInButton = ref<HTMLButtonElement | null>(null)
const zoomOutButton = ref<HTMLButtonElement | null>(null)

// Event handlers
function onZoomIn(e: Event): void {
  emit('zoom_in', e)
}

function onZoomOut(e: Event): void {
  emit('zoom_out', e)
}

function onBackToStart(e: Event): void {
  emit('back_to_start', e)
}

function onForwardToEnd(e: Event): void {
  emit('forward_to_end', e)
}

// Public methods - expose with defineExpose
function toogleZoomIn(show: boolean): void {
  if (zoomInButton.value) {
    zoomInButton.value.style.display = show ? 'block' : 'none'
  }
}

function toogleZoomOut(show: boolean): void {
  if (zoomOutButton.value) {
    zoomOutButton.value.style.display = show ? 'block' : 'none'
  }
}

function changeVisibleTicks(visibleTicks: any): void {
  // Implementation for updating visible ticks
}

// Expose public methods
defineExpose({
  toogleZoomIn,
  toogleZoomOut,
  changeVisibleTicks,
})
</script>

<template>
  <!-- .tl-menubar -->
  <div class="tl-menubar absolute z-11 text-center text-[#333] overflow-hidden border-b-10px border-t-10px top-[100%] left-[50%] left-0">
    <!-- .tl-menubar-button -->
    <button
      ref="zoomInButton"
      class="tl-menubar-button border-none text-18px lh-18px bg-[rgba(242,242,242,0.9)] cursor-pointer pt-5px pb-5px pl-10px pr-10px inline-block block text-[#bfbfbf] tl-menubar-button-zoomin"
      @click="onZoomIn"
    >
      {{ language.messages.zoom_in }}
    </button>
    <!-- .tl-menubar-button -->
    <button
      ref="zoomOutButton"
      class="tl-menubar-button border-none text-18px lh-18px bg-[rgba(242,242,242,0.9)] cursor-pointer pt-5px pb-5px pl-10px pr-10px inline-block block text-[#bfbfbf] tl-menubar-button-zoomout"
      @click="onZoomOut"
    >
      <font-awesome-icon :icon="byPrefixAndName.fas['house']" />
      {{ language.messages.zoom_out }}
    </button>
    <!-- .tl-menubar-button -->
    <button
      class="tl-menubar-button border-none text-18px lh-18px bg-[rgba(242,242,242,0.9)] cursor-pointer pt-5px pb-5px pl-10px pr-10px inline-block block text-[#bfbfbf] tl-menubar-button-backtostart"
      @click="onBackToStart"
    >
      {{ language.messages.return_to_title }}
    </button>
    <!-- .tl-menubar-button -->
    <button
      class="tl-menubar-button border-none text-18px lh-18px bg-[rgba(242,242,242,0.9)] cursor-pointer pt-5px pb-5px pl-10px pr-10px inline-block block text-[#bfbfbf] tl-menubar-button-forwardtoend"
      @click="onForwardToEnd"
    >
      {{ language.messages.go_to_end }}
    </button>
  </div>
</template>

<style scoped>
</style>

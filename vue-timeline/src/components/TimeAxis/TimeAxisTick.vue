<script lang="ts" setup>
interface Props {
  position: number
  label: string
  type: 'major' | 'minor'
  date: Date
}

defineProps<Props>()
</script>

<template>
  <div
    class="tl-timeaxis-tick"
    :class="[`tl-timeaxis-tick-${type}`]"
    :style="{
      position: 'absolute',
      left: `${position}px`,
    }"
  >
    <span class="tl-timeaxis-tick-label">
      {{ label }}
    </span>
  </div>
</template>

<style>
</style>

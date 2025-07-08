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
  <!-- .tl-timeaxis-tick -->
  <div
    v-if="$props.type === 'major'"
    :style="{
      top: 0,
      position: 'absolute',
      left: `${position}px`,
      color: `var(--${type}-ticks-color)`,
      width: `var(--${type}-ticks-width)`,
      fontSize: `var(--${type}-ticks-font-size)`,
      lineHeight: `calc(var(--${type}-ticks-font-size) + var(--tick-padding))`,
    }"
  >
    <!-- .tl-timeaxis-tick-text -->
    <div
      class="before:(b-l-1px b-l-solid b-l-black)"
    >
      {{ label }}
    </div>
  </div>
  <div
    v-else
    :style="{
      top: 0,
      position: 'absolute',
      left: `${position}px`,
      color: `var(--${type}-ticks-color)`,
      width: `var(--${type}-ticks-width)`,
      fontSize: `var(--${type}-ticks-font-size)`,
      lineHeight: `calc(var(--${type}-ticks-font-size) + var(--tick-padding))`,
    }"
  >
    <!-- .tl-timeaxis-tick-text -->
    <span
      class="op-0 whitespace-normal px-2px"
    >
      {{ label }}
    </span>
  </div>
</template>

<style>
</style>

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
    class="absolute block top-0 left-0 text-center font-normal"
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
      class="inline-block whitespace-nowrap text-ellipsis overflow-hidden before:content='|' before:text-[#FFF] before:w-1px before:overflow-hidden before:border-l-1px before:border-l-solid before:border-l-[#bfbfbf] before:text-center"
    >
      {{ label }}
    </span>
  </div>
  <div
    v-else
    class="absolute block top-0 left-0 text-center font-normal"
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
      class="inline-block whitespace-nowrap text-ellipsis overflow-hidden before:content='|' before:text-[#FFF] before:w-1px before:overflow-hidden before:border-l-1px before:border-l-solid before:border-l-[#bfbfbf] before:text-center"
    >
      {{ label }}
    </span>
  </div>
</template>

<style>
</style>

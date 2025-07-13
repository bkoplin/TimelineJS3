<script lang="ts" setup>
import type { Moment } from 'moment'

interface Props {
  position: number
  label: string
  type: string
  date: Moment
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
      left: `${$props.position}px`,
      color: `var(--${$props.type}-ticks-color)`,
      width: `var(--${$props.type}-ticks-width)`,
      fontSize: `var(--${$props.type}-ticks-font-size)`,
      lineHeight: `calc(var(--${$props.type}-ticks-font-size) + var(--tick-padding))`,
    }"
  >
    <!-- .tl-timeaxis-tick-text -->
    <span
      class="inline-block whitespace-nowrap text-ellipsis overflow-hidden before:content='|' before:text-[#FFF] before:w-[1px] before:overflow-hidden before:border-l-[1px] before:border-l-solid before:border-l-[#bfbfbf] before:text-center"
    >
      {{ $props.label }}
    </span>
  </div>
  <div
    v-else
    class="absolute block top-0 left-0 text-center font-normal"
    :style="{
      top: 0,
      position: 'absolute',
      left: `${$props.position}px`,
      color: `var(--${$props.type}-ticks-color)`,
      width: `var(--${$props.type}-ticks-width)`,
      fontSize: `var(--${$props.type}-ticks-font-size)`,
      lineHeight: `calc(var(--${$props.type}-ticks-font-size) + var(--tick-padding))`,
    }"
  >
    <!-- .tl-timeaxis-tick-text -->
    <span
      class="inline-block whitespace-nowrap text-ellipsis overflow-hidden before:content='|' before:text-[#FFF] before:w-[1px] before:overflow-hidden before:border-l-[1px] before:border-l-solid before:border-l-[#bfbfbf] before:text-center"
    >
      {{ $props.label }}
    </span>
  </div>
</template>

<style>
</style>

<script lang="ts" setup>
import type { Moment } from 'moment'

interface Props {
  position: number
  label: string
  type: string
  date: Moment
}

const props = defineProps<Props>()
const parentEl = useParentElement()
const parentBounding = useElementBounding(parentEl)
// const isVisible = useProjection(() => props.position, )
</script>

<template>
  <!-- .tl-timeaxis-tick -->
  <div
    v-if="$props.type === 'major'"
    class="absolute block top-0 text-left font-normal leading-none"
    :style="{
      left: `${$props.position}px`,
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
    class="absolute block bottom-0 text-left font-normal leading-none"
    :style="{
      left: `${$props.position}px`,
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

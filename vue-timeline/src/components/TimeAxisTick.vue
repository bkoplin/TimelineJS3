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

<style scoped>
.tl-timeaxis-tick {
  height: 100%;
  border-left: 1px solid #cccccc;
  pointer-events: none;
}

.tl-timeaxis-tick-major {
  border-left-color: #999999;
  border-left-width: 2px;
}

.tl-timeaxis-tick-minor {
  border-left-color: #eeeeee;
}

.tl-timeaxis-tick-label {
  position: absolute;
  top: 5px;
  left: 5px;
  font-size: 12px;
  color: #666666;
  white-space: nowrap;
  pointer-events: none;
}

.tl-timeaxis-tick-major .tl-timeaxis-tick-label {
  font-weight: bold;
  color: #333333;
}
</style>

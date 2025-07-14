<!-- Example usage of the GsapDraggable component -->

<script lang="ts" setup>
import type { Draggable } from '@/composables/useGsap'
import { ref } from 'vue'
import GsapDraggable from './GsapDraggable.vue'

// Reference to the draggable component
const draggableRef = ref<InstanceType<typeof GsapDraggable>>()

// Example event handlers
function handleDragStart(event: Event, draggable: Draggable) {
  // eslint-disable-next-line no-console
  console.log('Drag started:', { event, draggable })
}

function handleDrag(event: Event, draggable: Draggable) {
  // eslint-disable-next-line no-console
  console.log('Dragging:', { x: draggable.x, y: draggable.y })
}

function handleDragEnd(event: Event, draggable: Draggable) {
  // eslint-disable-next-line no-console
  console.log('Drag ended:', { x: draggable.x, y: draggable.y })
}

// Example of calling methods on the draggable instance
function centerElement() {
  draggableRef.value?.update(true, true)
}

function disableDragging() {
  draggableRef.value?.disable()
}

function enableDragging() {
  draggableRef.value?.enable()
}
</script>

<template>
  <div class="container">
    <h3>GSAP Draggable Example</h3>
    
    <!-- Basic draggable element -->
    <GsapDraggable
      ref="draggableRef"
      type="x,y"
      bounds="parent"
      @dragstart="handleDragStart"
      @drag="handleDrag"
      @dragend="handleDragEnd"
    >
      <div class="draggable-box primary">
        Drag me!
      </div>
    </GsapDraggable>

    <!-- Control buttons -->
    <div class="controls">
      <button
        style="margin-right: 10px"
        @click="centerElement"
      >
        Center Element
      </button>
      <button
        style="margin-right: 10px"
        @click="disableDragging"
      >
        Disable
      </button>
      <button @click="enableDragging">
        Enable
      </button>
    </div>

    <!-- X-only draggable -->
    <GsapDraggable
      type="x"
      bounds="parent"
      class="x-only"
    >
      <div class="draggable-box secondary">
        X-only drag
      </div>
    </GsapDraggable>

    <!-- Rotation draggable -->
    <GsapDraggable
      type="rotation"
      class="rotation"
    >
      <div class="draggable-box tertiary">
        ↻
      </div>
    </GsapDraggable>
  </div>
</template>

<style scoped>
.container {
  padding: 50px;
  min-height: 500px;
  border: 2px dashed #ccc;
}

.draggable-box {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  cursor: grab;
  user-select: none;
  border-radius: 10px;
}

.primary {
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
}

.secondary {
  width: 150px;
  height: 50px;
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  border-radius: 25px;
}

.tertiary {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 50%;
}

.controls {
  margin-top: 20px;
}

.x-only {
  margin-top: 30px;
}

.rotation {
  margin-top: 30px;
}
</style>

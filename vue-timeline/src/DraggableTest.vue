<script lang="ts" setup>
import type { Draggable } from '@/composables/registerGsap'
import { computed, ref } from 'vue'
import GsapDraggable from './components/GSAP/GsapDraggable.vue'

// Test the component
const draggableRef = ref<InstanceType<typeof GsapDraggable>>()

// Demonstrate reactivity by accessing the reactive properties
const currentX = computed(() => draggableRef.value?.x ?? 0)
const currentY = computed(() => draggableRef.value?.y ?? 0)
const isCurrentlyDragging = computed(() => draggableRef.value?.isDragging ?? false)

function handleDragStart(event: Event, draggable: Draggable) {
  console.warn('Drag started:', { x: draggable.x, y: draggable.y })
}

function handleDrag(event: Event, draggable: Draggable) {
  console.warn('Dragging:', { x: draggable.x, y: draggable.y })
}

function handleDragEnd(event: Event, draggable: Draggable) {
  console.warn('Drag ended:', { x: draggable.x, y: draggable.y })
}

function disableDragging() {
  draggableRef.value?.disable()
}

function enableDragging() {
  draggableRef.value?.enable()
}
</script>

<template>
  <div style="padding: 50px; min-height: 100vh; background: #f0f0f0;">
    <h1>GSAP Draggable Component Test</h1>
    
    <!-- Show reactive properties -->
    <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h3>Reactive Properties (updates live):</h3>
      <p><strong>Position:</strong> X: {{ currentX.toFixed(1) }}, Y: {{ currentY.toFixed(1) }}</p>
      <p><strong>Is Dragging:</strong> {{ isCurrentlyDragging ? 'Yes' : 'No' }}</p>
    </div>

    <div style="margin: 20px 0;">
      <button
        style="margin-right: 10px; padding: 8px 16px;"
        @click="disableDragging"
      >
        Disable
      </button>
      <button
        style="padding: 8px 16px;"
        @click="enableDragging"
      >
        Enable
      </button>
    </div>

    <div style="border: 2px dashed #ccc; padding: 50px; margin: 20px 0; position: relative; height: 400px;">
      <GsapDraggable
        ref="draggableRef"
        type="x"
        @dragstart="handleDragStart"
        @drag="handleDrag"
        @dragend="handleDragEnd"
      >
        <div
          style="
            width: 100px;
            height: 100px;
            background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            cursor: grab;
            user-select: none;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          "
        >
          Drag me!
        </div>
      </GsapDraggable>
    </div>
    
    <p>Open the browser console to see drag events. Watch the reactive properties update above as you drag!</p>
  </div>
</template>

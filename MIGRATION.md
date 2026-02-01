# Migration Guide: TimelineJS3 to VueTimelineJS3

## Overview

This document provides a comprehensive guide for migrating from the original TimelineJS3 JavaScript library to the new VueTimelineJS3 component built with Vue 3 and TypeScript.

## Breaking Changes

### 1. **Google Sheets Support Removed**

**Old Behavior:**
```javascript
const timeline = new TL.Timeline('timeline', 'https://docs.google.com/spreadsheets/...');
```

**New Approach:**
You must convert your Google Sheets data to JSON first. Use the [Google Sheets API](https://developers.google.com/sheets/api) or export as CSV and convert to JSON.

```typescript
// Fetch and convert your data to JSON
const response = await fetch('/api/timeline-data');
const data = await response.json();

// Use with Vue component
<VueTimelineJS3 :data="data" />
```

### 2. **No Vanilla JavaScript API**

**Old:**
```javascript
import { Timeline } from '@knight-lab/timelinejs';
const timeline = new Timeline('timeline-embed', data, options);
```

**New:**
Must be used as a Vue 3 component:
```vue
<template>
  <VueTimelineJS3 :data="timelineData" :options="options" />
</template>

<script setup lang="ts">
import { VueTimelineJS3 } from '@knight-lab/timelinejs'
</script>
```

### 3. **Data Immutability**

**Old Behavior:**
TimelineJS3 would mutate your input data objects.

**New Behavior:**
All data is cloned internally. Your original data objects are never modified.

### 4. **No LESS Stylesheets**

**Old:**
```javascript
import '@knight-lab/timelinejs/dist/css/timeline.css'; // LESS compiled
```

**New:**
```javascript
import '@knight-lab/timelinejs/dist/vue-timeline-js3.css'; // SCSS + UnoCSS
```

### 5. **Module System Changes**

**Old Package Exports:**
```json
{
  "main": "./dist/js/timeline.js"
}
```

**New Package Exports:**
```json
{
  "type": "module",
  "main": "./dist/vue-timeline-js3.umd.js",
  "module": "./dist/vue-timeline-js3.es.js",
  "types": "./dist/index.d.ts"
}
```

## Step-by-Step Migration

### Step 1: Update Dependencies

```bash
# Remove old package (if installed)
npm uninstall @knight-lab/timelinejs

# Install Vue 3 (if not already installed)
npm install vue@3

# Install new package
npm install @knight-lab/timelinejs@latest
```

### Step 2: Convert Google Sheets Data to JSON

If you're using Google Sheets, you'll need to convert your data:

**Option A: Manual Export**
1. Open your Google Sheet
2. File → Download → Comma-separated values (.csv)
3. Convert CSV to JSON using a converter tool
4. Save as JSON file in your project

**Option B: Programmatic (Recommended)**
```typescript
// Use Google Sheets API or a backend service to convert
async function fetchTimelineData() {
  const response = await fetch('/api/sheets-to-json?id=YOUR_SHEET_ID');
  return await response.json();
}
```

### Step 3: Refactor to Vue Component

**Before (TimelineJS3):**
```html
<!-- index.html -->
<div id="timeline-embed"></div>
<script src="timeline.js"></script>
<script>
  var timeline = new TL.Timeline('timeline-embed', 'data.json', {
    height: 600
  });
</script>
```

**After (VueTimelineJS3):**
```vue
<!-- TimelinePage.vue -->
<template>
  <div class="timeline-page">
    <VueTimelineJS3
      :data="timelineData"
      :options="timelineOptions"
      @ready="onTimelineReady"
      @change="onSlideChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VueTimelineJS3 } from '@knight-lab/timelinejs'
import type { TimelineData, TimelineOptions } from '@knight-lab/timelinejs'

const timelineData = ref<TimelineData>({ events: [] })
const timelineOptions = ref<Partial<TimelineOptions>>({
  height: 600
})

onMounted(async () => {
  const response = await fetch('/data/timeline.json')
  timelineData.value = await response.json()
})

function onTimelineReady() {
  console.log('Timeline is ready!')
}

function onSlideChange(data: { unique_id: string; slide_index: number }) {
  console.log('Changed to slide:', data.slide_index)
}
</script>

<style scoped>
.timeline-page {
  width: 100%;
  height: 100vh;
}
</style>
```

### Step 4: Update Event Handlers

**Before:**
```javascript
timeline.on('change', function(data) {
  console.log('Slide changed:', data.unique_id);
});
```

**After:**
```vue
<VueTimelineJS3
  @change="onSlideChange"
  @ready="onReady"
  @zoom_in="onZoomIn"
/>

<script setup>
function onSlideChange(data) {
  console.log('Slide changed:', data.unique_id);
}

function onReady() {
  console.log('Timeline ready');
}

function onZoomIn(data) {
  console.log('Zoomed in, level:', data.zoom_level);
}
</script>
```

### Step 5: Update Method Calls

**Before:**
```javascript
timeline.goTo(2);
timeline.goToNext();
timeline.getData(0);
```

**After:**
```vue
<template>
  <VueTimelineJS3 ref="timelineRef" :data="data" />
  <button @click="goToSlide(2)">Go to slide 2</button>
</template>

<script setup>
import { ref } from 'vue'

const timelineRef = ref()

function goToSlide(index) {
  timelineRef.value?.goTo(index)
}

function nextSlide() {
  timelineRef.value?.goToNext()
}

function getSlideData(index) {
  return timelineRef.value?.getData(index)
}
</script>
```

## New Features

### 1. Custom Property Mapping

Map your custom data structure to timeline format:

```vue
<VueTimelineJS3
  :data="myCustomData"
  :property-mapping="{
    event: {
      startDate: 'when',
      headline: 'title',
      text: 'description',
      uniqueId: 'id'
    },
    date: {
      year: 'y',
      month: 'm',
      day: 'd'
    }
  }"
/>
```

Now use your own structure:
```typescript
const myCustomData = {
  events: [
    {
      id: 'evt-1',
      title: 'My Event',
      description: 'Details here',
      when: { y: 2020, m: 6, d: 15 }
    }
  ]
}
```

### 2. TypeScript Support

Full TypeScript definitions included:

```typescript
import type { 
  TimelineData,
  TimelineOptions,
  TimelineEvent,
  TimelinePropertyMapping
} from '@knight-lab/timelinejs'

const data: TimelineData = {
  events: [...]
}

const options: Partial<TimelineOptions> = {
  height: 600,
  timenav_position: 'bottom'
}
```

### 3. Custom Icons

Easily customize icons:

```vue
<VueTimelineJS3
  :custom-icons="{
    'zoom-in': 'my-zoom-in-class',
    'zoom-out': 'my-zoom-out-class',
    'next': 'my-next-icon',
    'previous': 'my-prev-icon'
  }"
/>
```

### 4. Comprehensive Events

All 19+ events are now strongly typed:

```vue
<VueTimelineJS3
  @change="onChange"
  @ready="onReady"
  @loaded="onLoaded"
  @dataloaded="onDataLoaded"
  @zoom_in="onZoomIn"
  @zoom_out="onZoomOut"
  @nav_next="onNavNext"
  @nav_previous="onNavPrevious"
  @back_to_start="onBackToStart"
  @forward_to_end="onForwardToEnd"
  @markerclick="onMarkerClick"
  @media_loaded="onMediaLoaded"
/>
```

## Common Migration Patterns

### Pattern 1: Loading Data from URL

**Before:**
```javascript
new TL.Timeline('timeline', 'https://example.com/data.json');
```

**After:**
```vue
<template>
  <VueTimelineJS3 v-if="timelineData" :data="timelineData" />
  <div v-else>Loading...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const timelineData = ref(null)

onMounted(async () => {
  const response = await fetch('https://example.com/data.json')
  timelineData.value = await response.json()
})
</script>
```

### Pattern 2: Programmatic Navigation

**Before:**
```javascript
timeline.goToNext();
timeline.goToPrev();
timeline.goTo(5);
```

**After:**
```vue
<template>
  <VueTimelineJS3 ref="timeline" :data="data" />
  <div class="controls">
    <button @click="timeline?.goToPrev()">Previous</button>
    <button @click="timeline?.goToNext()">Next</button>
    <button @click="timeline?.goTo(5)">Go to Slide 5</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const timeline = ref()
</script>
```

### Pattern 3: Responsive Height

**Before:**
```javascript
new TL.Timeline('timeline', data, {
  height: window.innerHeight
});

window.addEventListener('resize', () => {
  timeline.updateDisplay(); // If this method existed
});
```

**After:**
```vue
<template>
  <VueTimelineJS3 :data="data" :options="options" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const options = ref({
  height: window.innerHeight
})

function updateHeight() {
  options.value = {
    ...options.value,
    height: window.innerHeight
  }
}

onMounted(() => window.addEventListener('resize', updateHeight))
onUnmounted(() => window.removeEventListener('resize', updateHeight))
</script>
```

## Troubleshooting

### Issue: "Module not found: @knight-lab/timelinejs"

**Solution:** Make sure you've installed Vue 3 and the latest version of the package:
```bash
npm install vue@3 @knight-lab/timelinejs@latest
```

### Issue: "Type errors with TimeScript"

**Solution:** Ensure your `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "types": ["node"]
  }
}
```

### Issue: "Styles not loading"

**Solution:** Make sure to import the CSS:
```typescript
import '@knight-lab/timelinejs/dist/vue-timeline-js3.css'
```

Or in your Vite config:
```typescript
// vite.config.ts
export default {
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@knight-lab/timelinejs/dist/vue-timeline-js3.css";`
      }
    }
  }
}
```

### Issue: "Google Sheets not working"

**Solution:** Google Sheets is no longer supported. Convert your data to JSON. See "Step 2: Convert Google Sheets Data to JSON" above.

## Performance Improvements

VueTimelineJS3 includes several performance improvements:

1. **Lazy Loading**: Components are only rendered when needed
2. **Virtual Scrolling**: Large timelines render more efficiently
3. **Immutable Data**: Prevents unnecessary re-renders
4. **Tree-shakeable**: Only import what you use
5. **Smaller Bundle**: ES modules are ~48KB (vs 150KB+ in old version)

## Getting Help

- **Documentation**: See [README_VUE.md](./README_VUE.md)
- **Issues**: https://github.com/bkoplin/TimelineJS3/issues
- **Examples**: See `/demo` directory in the repository

## Summary

| Feature | TimelineJS3 (Old) | VueTimelineJS3 (New) |
|---------|------------------|---------------------|
| Framework | Vanilla JS | Vue 3 |
| Language | JavaScript | TypeScript |
| Build System | Webpack | Vite |
| Styles | LESS | SCSS + UnoCSS |
| Google Sheets | ✅ | ❌ (JSON only) |
| Data Mutation | Mutates input | Immutable |
| Bundle Size | ~150KB | ~48KB (ES) |
| Type Safety | ❌ | ✅ Full TypeScript |
| Custom Mapping | ❌ | ✅ |
| Icon Customization | Limited | Full Font Awesome + Custom |
| Event System | 8 events | 19+ events |

The migration requires some work, but you gain:
- Modern Vue 3 architecture
- Full TypeScript support
- Better performance
- Smaller bundle size
- More flexible API
- Better maintainability

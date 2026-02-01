# Migration Mapping: TimelineJS3 → VueTimelineJS3

Complete mapping from original JavaScript implementation to new Vue 3 + TypeScript implementation.

## Table of Contents

- [Overview](#overview)
- [Architecture Changes](#architecture-changes)
- [Component Mapping](#component-mapping)
- [Composable Mapping](#composable-mapping)
- [API Method Mapping](#api-method-mapping)
- [Event Mapping](#event-mapping)
- [Configuration Mapping](#configuration-mapping)
- [Code Examples](#code-examples)

---

## Overview

### Migration Summary

| Aspect | Old (v3.x) | New (v4.0 Vue) |
|--------|-----------|----------------|
| **Framework** | Vanilla JavaScript | Vue 3 + TypeScript |
| **Build System** | Webpack | Vite |
| **Styling** | LESS | SCSS + UnoCSS |
| **Icons** | Hardcoded Font Awesome | Customizable (any library) |
| **State Management** | Mutable objects | Immutable reactive state |
| **Data Source** | JSON + Google Sheets | JSON only (customizable mapping) |
| **Bundle Size (JS)** | ~150 KB | 48 KB (68% smaller) |
| **TypeScript** | No | Full support |
| **Event System** | Custom mixin | Vue emit system |

---

## Architecture Changes

### Old Architecture (v3.x)
```
Timeline (class)
├── StorySlider (class)
├── TimeNav (class)
├── TimeScale (class)
├── MenuBar (class)
├── Message (class)
└── Events (mixin)
```

### New Architecture (v4.0)
```
VueTimelineJS3 (Vue component)
├── TimelineSlider (Vue SFC)
│   └── TimelineSlide (Vue SFC)
│       └── TimelineMedia (Vue SFC)
├── TimelineNav (Vue SFC)
├── TimelineMenuBar (Vue SFC)
├── TimelineMessage (Vue SFC)
└── Composables
    ├── useTimelineState
    ├── useTimelineEvents
    ├── usePropertyMapping
    ├── useTimelinePositioning (D3 Scale)
    ├── useTimelineAnimation
    ├── useKeyboardNavigation
    ├── useTouchNavigation
    └── useIconProvider
```

---

## Component Mapping

### Main Timeline Component

| Old | New | Notes |
|-----|-----|-------|
| `TL.Timeline` (class) | `VueTimelineJS3` (component) | Main component, now Vue SFC |
| `new TL.Timeline('id', data)` | `<VueTimelineJS3 :data="data" />` | Declarative Vue syntax |
| `timeline.goTo(index)` | `timeline.goTo(index)` | Same method via ref |
| `timeline.getData()` | `timeline.getData()` | Same method via ref |
| `timeline.destroy()` | N/A (automatic) | Vue lifecycle handles cleanup |

**Migration Example:**
```javascript
// OLD (v3.x)
var timeline = new TL.Timeline('timeline-embed', timelineData, options);
timeline.on('change', function(e) {
  console.log('Changed:', e);
});

// NEW (v4.0)
<template>
  <VueTimelineJS3 
    :data="timelineData" 
    :options="options"
    @change="onChange"
  />
</template>

<script setup>
const onChange = (e) => console.log('Changed:', e)
</script>
```

### Slider Components

| Old File | New File | Type | Notes |
|----------|----------|------|-------|
| `src/js/slider/TL.StorySlider.js` | `src/components/TimelineSlider.vue` | Vue SFC | Main slider container |
| `src/js/slide/TL.Slide.js` | `src/components/TimelineSlide.vue` | Vue SFC | Individual slide |
| `src/js/media/TL.Media.js` | `src/components/TimelineMedia.vue` | Vue SFC | Media rendering |

### Navigation Components

| Old File | New File | Type | Notes |
|----------|----------|------|-------|
| `src/js/timenav/TL.TimeNav.js` | `src/components/TimelineNav.vue` | Vue SFC | Timeline navigation bar |
| `src/js/timenav/TL.TimeMarker.js` | Integrated in `TimelineNav.vue` | Part of parent | Now template-driven |
| `src/js/timenav/TL.TimeEra.js` | Integrated in `TimelineNav.vue` | Part of parent | Now template-driven |
| `src/js/timenav/TL.TimeGroup.js` | Not implemented | Removed | Groups not in v4.0 |

### UI Components

| Old File | New File | Type | Notes |
|----------|----------|------|-------|
| `src/js/ui/TL.MenuBar.js` | `src/components/TimelineMenuBar.vue` | Vue SFC | Menu/control bar |
| `src/js/ui/TL.Message.js` | `src/components/TimelineMessage.vue` | Vue SFC | Loading/error messages |

---

## Composable Mapping

### State Management

| Old Class/Mixin | New Composable | Purpose |
|-----------------|----------------|---------|
| `TL.Events` (mixin) | `useTimelineEvents` | Event emission system |
| Timeline state (internal) | `useTimelineState` | Reactive state management |
| N/A | `usePropertyMapping` | Custom data structure mapping |

**State Management Example:**
```javascript
// OLD: Direct state mutation
this._state = { currentSlide: 0 };
this._state.currentSlide = 1; // Mutates state

// NEW: Immutable state with composable
const state = useTimelineState(data, options)
const { currentSlideIndex, setCurrentSlide } = state
setCurrentSlide(1) // Immutable update
```

### Positioning & Scale

| Old Class | New Composable/Utility | Technology |
|-----------|------------------------|------------|
| `src/js/timenav/TL.TimeScale.js` | `useTimelinePositioning` + `src/utils/timelinePositioning.ts` | D3 Scale (industry standard) |
| `src/js/timenav/TL.AxisHelper.js` | `src/utils/timelinePositioning.ts` (D3 auto-ticks) | Built into D3 |
| `src/js/core/TL.Date.js` | `src/utils/date.ts` | Utility functions |
| `src/js/core/TL.TimeScale.js` | D3 Scale `scaleTime()` | Third-party library |

**Positioning Example:**
```javascript
// OLD: Complex custom logic
var timeScale = new TL.TimeScale(config);
timeScale._calculateTicks();
var position = timeScale.getPosition(date);

// NEW: D3 Scale (transparent and simple)
const scale = scaleTime()
  .domain([startDate, endDate])
  .range([0, pixelWidth])
const position = scale(date) // That's it!
```

### Animation & Interaction

| Old Approach | New Composable | Notes |
|--------------|----------------|-------|
| Manual DOM manipulation | `useTimelineAnimation` | RequestAnimationFrame-based |
| Hardcoded keyboard listeners | `useKeyboardNavigation` | Configurable, enable/disable |
| No touch support | `useTouchNavigation` | Full swipe gesture support |

### Icons

| Old Approach | New Composable | Notes |
|--------------|----------------|-------|
| Hardcoded Font Awesome | `useIconProvider` | Support any icon library/format |

---

## API Method Mapping

### Instance Methods

| Old Method | New Method | Notes |
|------------|------------|-------|
| `timeline.goTo(n)` | `timeline.goTo(n)` | ✅ Same |
| `timeline.goToId(id)` | `timeline.goToId(id)` | ✅ Same |
| `timeline.goToNext()` | `timeline.goToNext()` | ✅ Same |
| `timeline.goToPrev()` | `timeline.goToPrev()` | ✅ Same |
| `timeline.goToStart()` | `timeline.goToStart()` | ✅ Same |
| `timeline.goToEnd()` | `timeline.goToEnd()` | ✅ Same |
| `timeline.getData()` | `timeline.getData()` | ✅ Same |
| `timeline.getSlide(n)` | `timeline.getSlide(n)` | ✅ Same |
| `timeline.getCurrentSlide()` | `timeline.getCurrentSlide()` | ✅ Same |
| `timeline.updateDisplay()` | N/A (automatic) | Vue reactivity handles updates |
| `timeline.setZoom(level)` | `timeline.setZoom(level)` | ✅ Same |
| `timeline.zoomIn()` | `timeline.zoomIn()` | ✅ Same with smooth animation |
| `timeline.zoomOut()` | `timeline.zoomOut()` | ✅ Same with smooth animation |
| `timeline.destroy()` | N/A (automatic) | Vue lifecycle cleanup |
| `timeline.add(event)` | `timeline.addEvent(event)` | Renamed for clarity |
| `timeline.remove(id)` | `timeline.removeEvent(id)` | Renamed for clarity |

**New Methods (v4.0 only):**

| New Method | Purpose |
|------------|---------|
| `timeline.enableKeyboardNavigation()` | Enable keyboard navigation |
| `timeline.disableKeyboardNavigation()` | Disable keyboard navigation |
| `timeline.enableTouchNavigation()` | Enable touch/swipe navigation |
| `timeline.disableTouchNavigation()` | Disable touch/swipe navigation |
| `timeline.setAnimations(enabled)` | Enable/disable animations |

---

## Event Mapping

### Event Names

| Old Event | New Event | Data Payload | Notes |
|-----------|-----------|--------------|-------|
| `change` | `change` | `{ unique_id, slide_index }` | ✅ Same |
| `loaded` | `loaded` | `{ scale, eras, events, title }` | ✅ Same |
| `ready` | `ready` | `undefined` | ✅ Same |
| `dataloaded` | `dataloaded` | `undefined` | ✅ Same |
| `nav_next` | `nav_next` | `undefined` | ✅ Same |
| `nav_previous` | `nav_previous` | `undefined` | ✅ Same |
| `back_to_start` | `back_to_start` | `undefined` | ✅ Same |
| `forward_to_end` | `forward_to_end` | `undefined` | ✅ Same |
| `zoom_in` | `zoom_in` | `{ zoom_level }` | Enhanced payload |
| `zoom_out` | `zoom_out` | `{ zoom_level }` | Enhanced payload |
| `added` | `added` | `{ unique_id }` | ✅ Same |
| `removed` | `removed` | `{ unique_id }` | ✅ Same |
| `markerclick` | `markerclick` | `{ unique_id }` | ✅ Same |
| `hash_updated` | `hash_updated` | `{ unique_id, hashbookmark }` | ✅ Same |
| `color_change` | `color_change` | `{ unique_id }` | ✅ Same |
| `background_change` | `background_change` | `{ unique_id }` | ✅ Same |
| `media_loaded` | `media_loaded` | `{ unique_id }` | ✅ Same |
| N/A | `keyboard_navigation` | `{ key, action }` | **NEW** |
| N/A | `swipe_left` | `undefined` | **NEW** |
| N/A | `swipe_right` | `undefined` | **NEW** |
| N/A | `swipe_up` | `undefined` | **NEW** |
| N/A | `swipe_down` | `undefined` | **NEW** |

**Event Listener Example:**
```javascript
// OLD (v3.x)
timeline.on('change', function(e) {
  console.log(e.unique_id);
});

// NEW (v4.0)
<VueTimelineJS3 
  @change="(e) => console.log(e.unique_id)"
/>
```

---

## Configuration Mapping

### Basic Options

| Old Option | New Option | Type | Notes |
|------------|------------|------|-------|
| `width` | `width` | number\|string | ✅ Same |
| `height` | `height` | number\|string | ✅ Same |
| `hash_bookmark` | `hash_bookmark` | boolean | ✅ Same |
| `default_bg_color` | `default_bg_color` | string | ✅ Same |
| `scale_factor` | `scale_factor` | number | ✅ Same |
| `initial_zoom` | `initial_zoom` | number | ✅ Same |
| `zoom_sequence` | `zoom_sequence` | number[] | ✅ Same |
| `timenav_position` | `timenav_position` | 'top'\|'bottom' | ✅ Same |
| `timenav_height` | `timenav_height` | number | ✅ Same |
| `start_at_slide` | `start_at_slide` | number | ✅ Same |
| `start_at_end` | `start_at_end` | boolean | ✅ Same |
| `menubar_height` | `menubar_height` | number | ✅ Same |
| `duration` | `duration` | number | ✅ Same |
| `ease` | `ease` | string | ✅ Same |
| `dragging` | `dragging` | boolean | ✅ Same |
| `language` | `language` | string | ✅ Same |

### New Options (v4.0)

| New Option | Type | Default | Purpose |
|------------|------|---------|---------|
| `icons` | object | Font Awesome | **Customize all icons** |
| `animations_enabled` | boolean | `true` | Enable/disable animations |
| `animation_duration` | number | `600` | Animation duration (ms) |
| `animation_easing` | string | `'cubic-bezier(0.4, 0.0, 0.2, 1)'` | Animation easing |
| `respect_reduced_motion` | boolean | `true` | Honor accessibility settings |
| `timeline_padding` | number | `0.1` | D3 scale padding (%) |
| `axis_tick_count` | number | `10` | Number of axis ticks |
| `scale_config` | object | `{}` | D3 scale configuration |
| `keyboard_navigation_enabled` | boolean | `true` | Enable keyboard navigation |
| `keyboard_navigation_keys` | object | Default keys | Custom key bindings |
| `touch_navigation_enabled` | boolean | `true` | Enable touch navigation |
| `swipe_min_distance` | number | `50` | Min swipe distance (px) |
| `swipe_velocity_threshold` | number | `0.3` | Swipe velocity threshold |

### Removed Options

| Removed Option | Reason |
|----------------|--------|
| `google_*` options | Google Sheets integration removed (use JSON only) |
| `api_*` options | API-specific options removed |
| `font` | Now use CSS/styling |
| Custom LESS variables | Replaced with SCSS variables |

---

## Code Examples

### Basic Timeline Creation

```javascript
// OLD (v3.x) - Vanilla JavaScript
<div id="timeline-embed"></div>

<script>
var timeline = new TL.Timeline('timeline-embed', {
  events: [
    {
      start_date: { year: 2020 },
      text: { headline: "Event" }
    }
  ]
});

timeline.on('change', function(e) {
  console.log('Changed to:', e.slide_index);
});
</script>
```

```vue
<!-- NEW (v4.0) - Vue 3 -->
<template>
  <VueTimelineJS3 
    :data="timelineData"
    @change="onChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import { VueTimelineJS3 } from '@knight-lab/timelinejs'

const timelineData = ref({
  events: [
    {
      start_date: { year: 2020 },
      text: { headline: "Event" }
    }
  ]
})

const onChange = (e) => {
  console.log('Changed to:', e.slide_index)
}
</script>
```

### Custom Icons

```vue
<!-- NEW (v4.0) - Custom Icons -->
<VueTimelineJS3 
  :data="timeline"
  :options="{
    icons: {
      // Font Awesome
      zoomIn: 'fa-solid fa-magnifying-glass-plus',
      
      // Emoji
      zoomOut: '🔍−',
      
      // SVG
      nextSlide: {
        svg: '<svg>...</svg>'
      },
      
      // Vue Component
      prevSlide: MyCustomIcon,
      
      // Image
      loading: {
        url: '/spinner.gif'
      }
    }
  }"
/>
```

### Custom Property Mapping

```vue
<!-- NEW (v4.0) - Custom Data Structure -->
<script setup>
// Your existing data structure
const myData = {
  items: [
    {
      when: '2020-01-01',
      title: 'Event',
      description: 'Text'
    }
  ]
}

// Map to timeline format
const propertyMapping = {
  events: 'items',
  event: {
    startDate: 'when',
    headline: 'title',
    text: 'description'
  }
}
</script>

<template>
  <VueTimelineJS3 
    :data="myData"
    :property-mapping="propertyMapping"
  />
</template>
```

### Keyboard & Touch Navigation

```vue
<!-- NEW (v4.0) - Navigation Control -->
<VueTimelineJS3 
  :options="{
    // Keyboard
    keyboard_navigation_enabled: true,
    keyboard_navigation_keys: {
      next: ['ArrowRight', 'd'],
      previous: ['ArrowLeft', 'a']
    },
    
    // Touch
    touch_navigation_enabled: true,
    swipe_min_distance: 50,
    swipe_velocity_threshold: 0.3
  }"
  @keyboard_navigation="onKeyboard"
  @swipe_left="onSwipeLeft"
/>
```

### Animations

```vue
<!-- NEW (v4.0) - Animation Control -->
<VueTimelineJS3 
  :options="{
    animations_enabled: true,
    animation_duration: 800,
    animation_easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    respect_reduced_motion: true
  }"
/>
```

### Programmatic API

```vue
<!-- NEW (v4.0) - Programmatic Control -->
<template>
  <button @click="timeline?.goToNext()">Next</button>
  <button @click="timeline?.zoomIn()">Zoom In</button>
  
  <VueTimelineJS3 ref="timeline" :data="data" />
</template>

<script setup>
import { ref } from 'vue'

const timeline = ref(null)

// Call methods
function customAction() {
  timeline.value?.goTo(5)
  timeline.value?.enableKeyboardNavigation()
  const data = timeline.value?.getData()
}
</script>
```

---

## Migration Checklist

### For Developers Migrating from v3.x

- [ ] Replace `new TL.Timeline()` with `<VueTimelineJS3>`
- [ ] Convert event listeners from `.on()` to `@event`
- [ ] Update data structure to JSON-only (remove Google Sheets)
- [ ] Replace method calls with `ref` access (`timeline.value.method()`)
- [ ] Update CSS class names if customized
- [ ] Test all custom event listeners
- [ ] Update icon references if customized
- [ ] Review and update any custom LESS styles to SCSS
- [ ] Test keyboard and touch navigation
- [ ] Verify animations and transitions
- [ ] Update build process from Webpack to Vite (if using bundler)

### Breaking Changes

1. **Google Sheets removed** - Use JSON data only
2. **Different component structure** - No direct DOM manipulation
3. **Event listener syntax** - Use Vue `@event` instead of `.on()`
4. **Icon system** - Icons now customizable (breaking if you relied on specific classes)
5. **Bundle format** - Now ES module + UMD instead of global `TL` object
6. **Build system** - Vite instead of Webpack

---

## Summary

**VueTimelineJS3** is a complete rewrite that:

✅ Maintains API compatibility where possible  
✅ Uses modern Vue 3 + TypeScript architecture  
✅ Provides better customization (icons, animations, navigation)  
✅ Improves performance (68% smaller bundle)  
✅ Adds new features (touch navigation, custom property mapping, D3 scale)  
✅ Removes deprecated features (Google Sheets, old build system)  

**Migration effort:** Medium - Most configuration and events are compatible, but requires Vue 3 setup and component syntax changes.

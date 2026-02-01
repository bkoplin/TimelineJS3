# Keyboard and Touch Navigation Guide - VueTimelineJS3

## Overview

VueTimelineJS3 includes comprehensive keyboard and touch navigation capabilities that can be independently enabled or disabled. This allows for flexible control over how users interact with the timeline.

## Features

### Keyboard Navigation

Full keyboard support for accessible timeline navigation:

**Navigation Keys:**
- **Arrow Left (←)**: Navigate to previous slide
- **Arrow Right (→)**: Navigate to next slide
- **Home**: Jump to first slide
- **End**: Jump to last slide
- **Ctrl/Cmd + Plus (+)**: Zoom in
- **Ctrl/Cmd + Minus (-)**: Zoom out
- **Space/Enter**: Select focused marker (when marker has focus)
- **Escape**: Cancel/close (reserved for future use)

**Accessibility:**
- Works with screen readers
- Follows ARIA keyboard navigation patterns
- Prevents default browser scrolling during navigation

### Touch Navigation

Intuitive swipe gestures for mobile and touch devices:

**Swipe Gestures:**
- **Swipe Left**: Navigate to next slide
- **Swipe Right**: Navigate to previous slide
- **Swipe Up**: Zoom in (optional)
- **Swipe Down**: Zoom out (optional)

**Features:**
- Velocity-based detection (natural feeling)
- Minimum distance threshold (prevents accidental triggers)
- Configurable sensitivity
- Optional scroll prevention

## Configuration

### Basic Usage

Both keyboard and touch navigation are **enabled by default**. You can control them through the `options` prop:

```vue
<template>
  <VueTimelineJS3
    :data="timeline"
    :options="{
      keyboard_navigation_enabled: true,
      touch_navigation_enabled: true
    }"
  />
</template>
```

### Enable/Disable Options

#### Keyboard Only (Desktop-First)

```vue
<VueTimelineJS3 :options="{
  keyboard_navigation_enabled: true,
  touch_navigation_enabled: false
}" />
```

**Use Case:** Desktop applications, kiosk displays, accessibility-focused interfaces

#### Touch Only (Mobile-First)

```vue
<VueTimelineJS3 :options="{
  keyboard_navigation_enabled: false,
  touch_navigation_enabled: true
}" />
```

**Use Case:** Mobile apps, tablet interfaces, touch-screen kiosks

#### Both Disabled (Button/Click Only)

```vue
<VueTimelineJS3 :options="{
  keyboard_navigation_enabled: false,
  touch_navigation_enabled: false
}" />
```

**Use Case:** Controlled navigation, presentation mode, guided tours

### Advanced Configuration

#### Custom Keyboard Bindings

Override default key bindings:

```typescript
<VueTimelineJS3 :options="{
  keyboard_navigation_enabled: true,
  keyboard_navigation_keys: {
    next: ['ArrowRight', 'd', 'PageDown'],
    previous: ['ArrowLeft', 'a', 'PageUp'],
    first: ['Home', '0'],
    last: ['End', '$'],
    zoomIn: ['+', '=', 'w'],
    zoomOut: ['-', '_', 's']
  }
}" />
```

**Available Actions:**
- `next`: Navigate to next slide
- `previous`: Navigate to previous slide
- `first`: Jump to first slide
- `last`: Jump to last slide
- `select`: Select focused element
- `escape`: Cancel/close
- `zoomIn`: Zoom in (requires Ctrl/Cmd modifier)
- `zoomOut`: Zoom out (requires Ctrl/Cmd modifier)

#### Touch Sensitivity

Fine-tune touch gesture detection:

```vue
<VueTimelineJS3 :options="{
  touch_navigation_enabled: true,
  swipe_min_distance: 50,          // Minimum pixels to trigger (default: 50)
  swipe_velocity_threshold: 0.3,   // Velocity threshold (default: 0.3)
  swipe_prevent_default: true      // Prevent default scrolling (default: true)
}" />
```

**Parameters:**
- `swipe_min_distance`: Minimum swipe distance in pixels (lower = more sensitive)
- `swipe_velocity_threshold`: Pixels per millisecond (lower = more sensitive)
- `swipe_prevent_default`: Prevent default browser scrolling during horizontal swipes

## Events

### Keyboard Navigation Event

Listen for keyboard navigation actions:

```vue
<VueTimelineJS3
  @keyboard_navigation="onKeyboardNav"
/>

<script setup>
function onKeyboardNav(data: { key: string; action: string }) {
  console.log(`Key: ${data.key}, Action: ${data.action}`)
  // Examples:
  // { key: 'next', action: 'nav_next' }
  // { key: 'previous', action: 'nav_previous' }
  // { key: 'first', action: 'back_to_start' }
  // { key: 'last', action: 'forward_to_end' }
}
</script>
```

### Touch Navigation Events

Listen for swipe gestures:

```vue
<VueTimelineJS3
  @swipe_left="onSwipeLeft"
  @swipe_right="onSwipeRight"
  @swipe_up="onSwipeUp"
  @swipe_down="onSwipeDown"
/>

<script setup>
function onSwipeLeft() {
  console.log('Swiped left - navigating to next')
}

function onSwipeRight() {
  console.log('Swiped right - navigating to previous')
}
</script>
```

## Programmatic Control

### Runtime Enable/Disable

Control navigation programmatically using the component instance:

```vue
<template>
  <VueTimelineJS3 ref="timelineRef" :data="timeline" />
  
  <button @click="toggleKeyboard">Toggle Keyboard</button>
  <button @click="toggleTouch">Toggle Touch</button>
</template>

<script setup>
import { ref } from 'vue'

const timelineRef = ref(null)

function toggleKeyboard() {
  if (timelineRef.value) {
    // Access the exposed methods
    timelineRef.value.disableKeyboardNavigation()
    // or
    timelineRef.value.enableKeyboardNavigation()
  }
}

function toggleTouch() {
  if (timelineRef.value) {
    timelineRef.value.disableTouchNavigation()
    // or
    timelineRef.value.enableTouchNavigation()
  }
}
</script>
```

**Available Methods:**
- `enableKeyboardNavigation()`: Enable keyboard navigation
- `disableKeyboardNavigation()`: Disable keyboard navigation
- `enableTouchNavigation()`: Enable touch navigation
- `disableTouchNavigation()`: Disable touch navigation

## Use Cases

### Presentation Mode

Disable all navigation for controlled presentations:

```vue
<VueTimelineJS3
  ref="timeline"
  :data="presentationData"
  :options="{
    keyboard_navigation_enabled: false,
    touch_navigation_enabled: false
  }"
/>

<!-- Use custom buttons for controlled navigation -->
<button @click="timeline.goToNext()">Next</button>
<button @click="timeline.goToPrev()">Previous</button>
```

### Accessibility-First

Keyboard navigation with screen reader support:

```vue
<VueTimelineJS3
  :options="{
    keyboard_navigation_enabled: true,
    touch_navigation_enabled: false,
    // Ensure animations respect reduced motion
    respect_reduced_motion: true
  }"
/>
```

### Mobile App

Touch-optimized for mobile devices:

```vue
<VueTimelineJS3
  :options="{
    keyboard_navigation_enabled: false,
    touch_navigation_enabled: true,
    swipe_min_distance: 30,  // More sensitive for mobile
    swipe_prevent_default: true
  }"
/>
```

### Responsive Design

Adapt to device capabilities:

```vue
<template>
  <VueTimelineJS3
    :data="timeline"
    :options="navigationOptions"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const isTouchDevice = ref(false)

onMounted(() => {
  isTouchDevice.value = 'ontouchstart' in window
})

const navigationOptions = computed(() => ({
  keyboard_navigation_enabled: !isTouchDevice.value,
  touch_navigation_enabled: isTouchDevice.value
}))
</script>
```

### Gaming/Interactive Experience

Custom key bindings for game-like controls:

```vue
<VueTimelineJS3 :options="{
  keyboard_navigation_enabled: true,
  keyboard_navigation_keys: {
    next: ['ArrowRight', 'd'],
    previous: ['ArrowLeft', 'a'],
    first: ['r'],  // Reset to beginning
    last: ['f'],   // Fast-forward to end
    zoomIn: ['w', 'q'],
    zoomOut: ['s', 'e']
  }
}" />
```

## Best Practices

### 1. Consider Your Audience

- **Desktop users**: Enable keyboard navigation
- **Mobile users**: Enable touch navigation
- **Mixed audience**: Enable both (default)
- **Controlled environment**: Disable both, use programmatic control

### 2. Provide Visual Feedback

Show users which navigation methods are available:

```vue
<div class="navigation-hints">
  <p v-if="options.keyboard_navigation_enabled">
    ⌨️ Use arrow keys to navigate
  </p>
  <p v-if="options.touch_navigation_enabled">
    👆 Swipe left/right to navigate
  </p>
</div>
```

### 3. Test Thoroughly

- Test keyboard navigation with screen readers
- Test touch gestures on actual mobile devices
- Verify zoom keyboard shortcuts don't conflict with browser
- Test with reduced motion preferences

### 4. Accessibility

Always consider accessibility:

```vue
<VueTimelineJS3 :options="{
  keyboard_navigation_enabled: true,  // Essential for accessibility
  respect_reduced_motion: true,
  animations_enabled: true
}" />
```

### 5. Performance

For touch devices with many events:

```vue
<VueTimelineJS3 :options="{
  touch_navigation_enabled: true,
  swipe_velocity_threshold: 0.5,  // Require more intentional swipes
  swipe_min_distance: 60  // Larger threshold to avoid accidental triggers
}" />
```

## Troubleshooting

### Keyboard Navigation Not Working

**Problem:** Arrow keys don't navigate

**Solutions:**
1. Ensure `keyboard_navigation_enabled: true`
2. Check that no other element has captured keyboard events
3. Verify no browser extension is interfering
4. Make sure the timeline container has focus

### Touch Gestures Not Detected

**Problem:** Swipes don't trigger navigation

**Solutions:**
1. Ensure `touch_navigation_enabled: true`
2. Check `swipe_min_distance` isn't too high
3. Verify `swipe_velocity_threshold` is appropriate
4. Test on actual touch device (not just mouse simulation)

### Conflicts with Browser Shortcuts

**Problem:** Keyboard shortcuts conflict with browser

**Solutions:**
1. Use custom key bindings that don't conflict
2. Avoid Ctrl+T, Ctrl+W, etc. (browser shortcuts)
3. Test in all target browsers

### Unwanted Scrolling

**Problem:** Swipes cause page scrolling

**Solutions:**
```vue
<VueTimelineJS3 :options="{
  swipe_prevent_default: true  // Prevent default scrolling
}" />
```

## Browser Support

**Keyboard Navigation:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Touch Navigation:**
- All modern mobile browsers
- Chrome/Firefox on touchscreen laptops
- Safari on iOS devices
- Chrome on Android devices

**Pointer Events API:**
- Used for optimal touch detection
- Graceful fallback for older browsers

## Summary

VueTimelineJS3's keyboard and touch navigation system provides:

✅ **Independent Control** - Enable/disable each independently  
✅ **Accessible** - Full keyboard navigation support  
✅ **Intuitive** - Natural swipe gestures  
✅ **Customizable** - Configure keys, sensitivity, and behavior  
✅ **Event-Driven** - Listen to navigation events  
✅ **Programmatic** - Control at runtime  
✅ **Well-Tested** - Works across devices and browsers  

Perfect for creating accessible, user-friendly timeline experiences!

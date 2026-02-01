# Timeline Positioning with D3 Scale

## Overview

VueTimelineJS3 uses **D3 Scale** for timeline positioning calculations. This provides:

- ✅ **Clear, industry-standard** approach
- ✅ **Transparent** - easy to understand how it works
- ✅ **Customizable** - control behavior through props
- ✅ **Well-documented** - leverage D3's excellent documentation

## Why D3 Scale?

The original TimelineJS3 had complex custom positioning logic that was:
- Hard to understand
- Difficult to customize
- Not industry-standard
- Poorly documented

D3 Scale solves all these problems with a battle-tested, well-documented API.

## How It Works

### Basic Concept

D3 Scale creates a mapping function between two ranges:

```typescript
const scale = scaleTime()
  .domain([earliestDate, latestDate])  // Input: date range
  .range([0, pixelWidth])              // Output: pixel positions

// Use it
const position = scale(eventDate)      // Returns pixel position
```

That's it! Crystal clear and easy to understand.

### In VueTimelineJS3

```typescript
// 1. Create scale from events
const { scale } = createTimelineScale(events, {
  displayWidth: 1000,
  screenMultiplier: 3,
  padding: 0.1
})

// 2. Position markers
const markerPositions = events.map(event => ({
  x: scale(eventDate),
  percentage: (scale(eventDate) / pixelWidth) * 100
}))

// 3. Generate axis ticks (D3 picks nice intervals)
const ticks = scale.ticks(10)
```

## Customization Through Props

### Basic Configuration

```vue
<VueTimelineJS3
  :data="timeline"
  :options="{
    width: 1000,
    timenav_position: 'bottom',
    
    // Timeline padding (0.1 = 10% on each side)
    timeline_padding: 0.1,
    
    // Number of axis ticks
    axis_tick_count: 8,
    
    // Scale multiplier (3 = 3x display width for scrolling)
    scale_factor: 3
  }"
/>
```

### Advanced Scale Configuration

For full control over D3 scale behavior:

```vue
<VueTimelineJS3
  :options="{
    scale_config: {
      displayWidth: 1200,        // Override display width
      screenMultiplier: 5,       // 5x width for more scrolling
      padding: 0.15,             // 15% padding
      minSpan: 31536000000       // Minimum 1 year span (in ms)
    }
  }"
/>
```

## Prop Reference

### `timeline_padding` (number)

Padding around the timeline as a percentage of the total time span.

- **Default**: `0.1` (10%)
- **Range**: `0.0` to `0.5`
- **Example**: `0.2` = 20% padding on each side

```vue
<VueTimelineJS3 :options="{ timeline_padding: 0.2 }" />
```

### `axis_tick_count` (number)

Number of tick marks to display on the timeline axis. D3 automatically picks nice intervals.

- **Default**: `10`
- **Range**: `2` to `50`
- **Note**: D3 may adjust this for better readability

```vue
<VueTimelineJS3 :options="{ axis_tick_count: 12 }" />
```

### `min_timeline_span` (number)

Minimum time span in milliseconds when all events are at the same time.

- **Default**: `31536000000` (1 year)
- **Units**: Milliseconds
- **Example**: `86400000` = 1 day

```vue
<VueTimelineJS3 :options="{ 
  min_timeline_span: 86400000  // 1 day minimum
}" />
```

### `scale_config` (object)

Direct control over D3 scale configuration:

```typescript
interface ScaleConfig {
  /** Override display width in pixels */
  displayWidth?: number
  
  /** Multiplier for scrollable width (3 = 3x display) */
  screenMultiplier?: number
  
  /** Override padding percentage */
  padding?: number
  
  /** Override minimum span in milliseconds */
  minSpan?: number
}
```

```vue
<VueTimelineJS3 :options="{
  scale_config: {
    displayWidth: 1200,
    screenMultiplier: 4,
    padding: 0.12,
    minSpan: 7776000000  // 90 days
  }
}" />
```

## Common Use Cases

### Wide Timeline (More Scrolling)

```vue
<VueTimelineJS3 :options="{
  scale_config: {
    screenMultiplier: 5  // 5x display width
  }
}" />
```

### Tight Timeline (Less Scrolling)

```vue
<VueTimelineJS3 :options="{
  scale_config: {
    screenMultiplier: 2  // 2x display width
  }
}" />
```

### More Axis Detail

```vue
<VueTimelineJS3 :options="{
  axis_tick_count: 20,      // More ticks
  timeline_padding: 0.05    // Less padding = more detail
}" />
```

### Sparse Timeline (Events Far Apart)

```vue
<VueTimelineJS3 :options="{
  timeline_padding: 0.3,    // More padding
  axis_tick_count: 6        // Fewer ticks
}" />
```

### Dense Timeline (Events Close Together)

```vue
<VueTimelineJS3 :options="{
  timeline_padding: 0.05,   // Less padding
  axis_tick_count: 15,      // More ticks
  scale_config: {
    screenMultiplier: 6     // More scrollable area
  }
}" />
```

## Understanding the Scale

### Domain vs Range

- **Domain**: The input values (dates)
  - Example: `[Jan 1, 2020, Dec 31, 2020]`
- **Range**: The output values (pixels)
  - Example: `[0, 3000]`

D3 creates a linear mapping between them:

```
Jan 1, 2020  →  0px
Jul 1, 2020  →  1500px (middle of year = middle of range)
Dec 31, 2020 →  3000px
```

### Padding Effect

Without padding:
```
[Jan 1] ←────────────────────→ [Dec 31]
0px                           3000px
```

With 10% padding:
```
      [Jan 1] ←──────────→ [Dec 31]
0px   300px              2700px    3000px
```

Events have breathing room on both sides.

## Advanced: Direct D3 Access

If you need even more control, you can access the D3 scale directly:

```typescript
import { useTimelinePositioning } from '@knight-lab/timelinejs'

const positioning = useTimelinePositioning(events, options)

// Access the D3 scale
const d3Scale = positioning.scale.value

// Use D3 methods directly
const tickValues = d3Scale.ticks(20)
const inverseDate = d3Scale.invert(500)  // What date is at 500px?
const scaleCopy = d3Scale.copy()         // Clone the scale
```

## Zoom Behavior

Zoom modifies the scale's domain (time range) while keeping the range (pixels) the same:

```typescript
// Zoom in 2x
const zoomedScale = createZoomTransform(scale, 2)

// Original: [Jan 1, Dec 31] → [0, 3000px]
// Zoomed:   [Apr 1, Sep 30] → [0, 3000px]  (half the time, same pixels)
```

This creates the zoom effect - same pixel width shows less time.

## Troubleshooting

### Events All Clustered Together

Increase the minimum span or add padding:

```vue
<VueTimelineJS3 :options="{
  min_timeline_span: 2592000000,  // 30 days minimum
  timeline_padding: 0.2
}" />
```

### Timeline Too Wide to Navigate

Reduce the screen multiplier:

```vue
<VueTimelineJS3 :options="{
  scale_config: { screenMultiplier: 2 }
}" />
```

### Ticks in Wrong Places

D3 picks "nice" intervals (round numbers). To force specific intervals, you'd need to customize the tick generation. The current count is a suggestion.

### Events Outside Visible Area

Check your padding. Too much padding might push events out:

```vue
<VueTimelineJS3 :options="{
  timeline_padding: 0.05  // Reduce padding
}" />
```

## Performance

D3 Scale is highly optimized:
- Scale creation: O(1) - very fast
- Position calculation: O(1) - just math
- Tick generation: O(n) where n = tick count (also fast)

Even with 1000s of events, positioning is nearly instant.

## Further Reading

- [D3 Scale Documentation](https://github.com/d3/d3-scale)
- [D3 scaleTime API](https://github.com/d3/d3-scale#scaleTime)
- [D3 Time Intervals](https://github.com/d3/d3-time)

## Summary

D3 Scale makes timeline positioning:

1. **Transparent** - You can see exactly what's happening
2. **Predictable** - Standard scale behavior
3. **Customizable** - Control through clear props
4. **Maintainable** - Industry-standard approach
5. **Well-documented** - Leverage D3's docs

Instead of complex custom logic, you get a proven, well-understood solution.

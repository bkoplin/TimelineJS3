# Vue TimelineJS

A Vue 3 component library based on TimelineJS3, designed to create beautiful, interactive timelines.

## Features

- Fully compatible with Vue 3
- Uses UnoCSS instead of LESS for styling
- Supports only JavaScript object data (no Google Sheets loading)
- Simplified for modern web applications

## Installation

```bash
npm install vue-timelinejs
```

Or with Yarn:

```bash
yarn add vue-timelinejs
```

## Basic Usage

### Global Registration

```js
import { createApp } from 'vue'
import App from './App.vue'
import VueTimelineJS from 'vue-timelinejs'
import 'vue-timelinejs/style'

const app = createApp(App)
app.use(VueTimelineJS)
app.mount('#app')
```

### Local Registration

```vue
<template>
  <div class="timeline-container">
    <Timeline :data="timelineData" :options="timelineOptions" @ready="onReady" />
  </div>
</template>

<script>
import { Timeline } from 'vue-timelinejs'
import 'vue-timelinejs/style'

export default {
  components: {
    Timeline
  },
  data() {
    return {
      timelineData: {
        title: {
          text: {
            headline: "Timeline Title",
            text: "Timeline description"
          }
        },
        events: [
          {
            start_date: {
              year: '2022',
              month: '1',
              day: '1'
            },
            text: {
              headline: "Event Title",
              text: "Event description"
            },
            media: {
              url: "https://example.com/image.jpg",
              caption: "Caption text",
              credit: "Credit text"
            }
          }
          // More events...
        ]
      },
      timelineOptions: {
        height: '600px',
        width: '100%',
        start_at_end: false,
        timenav_position: 'bottom'
      }
    }
  },
  methods: {
    onReady() {
      console.log('Timeline is ready')
    }
  }
}
</script>

<style>
.timeline-container {
  height: 600px;
  width: 100%;
}
</style>
```

## Timeline Data Structure

The timeline data should follow this structure:

```js
{
  title: {  // Optional
    text: {
      headline: "Timeline Title",
      text: "Timeline description"
    },
    media: {  // Optional
      url: "https://example.com/image.jpg",
      caption: "Caption text",
      credit: "Credit text"
    }
  },
  events: [
    {
      start_date: {
        year: '2022',
        month: '1',
        day: '1',
        hour: '13',  // Optional
        minute: '30', // Optional
        second: '00'  // Optional
      },
      end_date: {  // Optional
        year: '2022',
        month: '1',
        day: '10'
      },
      text: {
        headline: "Event Title",
        text: "Event description"
      },
      media: {  // Optional
        url: "https://example.com/image.jpg",
        caption: "Caption text",
        credit: "Credit text"
      },
      group: "Optional group name",
      unique_id: "optional-unique-id"  // Will be auto-generated if not provided
    },
    // More events...
  ]
}
```

## Timeline Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| height | String/Number | null | The height of the timeline |
| width | String/Number | null | The width of the timeline |
| scale_factor | Number | 2 | How many screen widths wide should the timeline be |
| layout | String | 'landscape' | Layout mode: 'landscape' or 'portrait' |
| timenav_position | String | 'bottom' | Position of the timeline navigation: 'bottom' or 'top' |
| start_at_slide | Number | 0 | The starting slide index |
| start_at_end | Boolean | false | Start at the end of the timeline |
| initial_zoom | Number | null | Initial zoom level |
| hash_bookmark | Boolean | false | Use URL hashes for bookmarking slides |
| font | String | 'default' | Font set to use |
| theme | String | null | Theme to use |

## Events

| Event Name | Description | Payload |
|------------|-------------|---------|
| ready | Fired when the timeline is ready | none |
| loaded | Fired when the timeline data is loaded | timeline config object |
| changed | Fired when the current slide changes | { unique_id } |
| colorchange | Fired when the color of the timeline changes | { unique_id } |
| nav_next | Fired when navigating to the next slide | event data |
| nav_previous | Fired when navigating to the previous slide | event data |
| zoom_in | Fired when zooming in | { zoom_level } |
| zoom_out | Fired when zooming out | { zoom_level } |
| back_to_start | Fired when navigating to the start | { unique_id } |
| forward_to_end | Fired when navigating to the end | { unique_id } |

## Methods

The following methods are exposed on the Timeline component and can be accessed via template refs:

| Method | Description |
|--------|-------------|
| goToId(id) | Navigate to a specific event by ID |
| goTo(n) | Navigate to a specific slide index |
| goToStart() | Navigate to the first slide |
| goToEnd() | Navigate to the last slide |
| goToPrev() | Navigate to the previous slide |
| goToNext() | Navigate to the next slide |
| zoomIn() | Zoom in on the timeline |
| zoomOut() | Zoom out on the timeline |
| setZoom(level) | Set a specific zoom level |
| updateDisplay() | Update the display (e.g., after container size changes) |

## License

This project is licensed under the Mozilla Public License 2.0 (MPL-2.0) - see the LICENSE file for details.

## Acknowledgements

Based on the TimelineJS3 project by Northwestern University Knight Lab.

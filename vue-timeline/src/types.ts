/**
 * TypeScript type definitions for the Vue Timeline application
 */

import type { Moment } from 'moment'

// Raw date input interface (before parsing to moment)
export interface RawDateInput {
  year?: string | number
  month?: string | number
  day?: string | number
  hour?: string | number
  minute?: string | number
  second?: string | number
  millisecond?: string | number
  display_date?: string
  format?: string
  [key: string]: any
}

// Language interface for internationalization
export interface Language {
  name: string
  lang: string
  direction: 'ltr' | 'rtl'
  messages: { [key: string]: string }
  date: {
    month: readonly string[]
    month_abbr: readonly string[]
    day: readonly string[]
    day_abbr: readonly string[]
  }
  aria_label_timeline?: string
  [key: string]: any
}

// Timeline event interface
export interface TimelineEvent {
  unique_id?: string
  start_date?: Moment
  end_date?: Moment
  text?: {
    headline?: string
    text?: string
  }
  media?: {
    url?: string
    caption?: string
    credit?: string
  }
  last?: boolean
  [key: string]: any
}

// Timeline event interface for raw input (before parsing)
export interface TimelineEventInput {
  unique_id?: string
  start_date?: RawDateInput
  end_date?: RawDateInput
  text?: {
    headline?: string
    text?: string
  }
  media?: {
    url?: string
    caption?: string
    credit?: string
  }
  last?: boolean
  [key: string]: any
}

// Timeline data structure
export interface TimelineData {
  title?: TimelineEventInput
  events: TimelineEventInput[]
  eras?: TimelineEraInput[]
  scale?: 'human' | 'cosmological'
  [key: string]: any
}

// Timeline data structure for processed data (after parsing)
export interface ProcessedTimelineData {
  title?: TimelineEvent
  events: TimelineEvent[]
  eras?: TimelineEra[]
  scale?: 'human' | 'cosmological'
  [key: string]: any
}

// Timeline configuration options
export interface TimelineOptions {
  height?: number | null
  width?: number | null
  debug?: boolean
  font?: string
  is_embed?: boolean
  is_full_embed?: boolean
  hash_bookmark?: boolean
  default_bg_color?: { r: number, g: number, b: number } | string
  scale_factor?: number
  layout?: 'landscape' | 'portrait'
  timenav_position?: 'top' | 'bottom'
  optimal_tick_width?: number
  base_class?: string
  timenav_height?: number | null
  timenav_height_percentage?: number
  timenav_mobile_height_percentage?: number
  timenav_height_min?: number
  marker_height_min?: number
  marker_width_min?: number
  marker_padding?: number
  start_at_slide?: number
  start_at_end?: boolean
  menubar_height?: number
  skinny_size?: number
  medium_size?: number
  use_bc?: boolean
  duration?: number
  ease?: Function
  dragging?: boolean
  trackResize?: boolean
  map_type?: string
  slide_padding_lr?: number
  slide_default_fade?: string
  zoom_sequence?: number[]
  track_events?: string[]
  theme?: string | null
  initial_zoom?: number
  storyslider_height?: number
  [key: string]: any
}

// Slide interface for the StorySlider component
export interface Slide {
  data: TimelineEvent
  position: number
  id: string
}

// Timeline change event payload
export interface TimelineChangeEvent {
  unique_id: string
}

// Timeline color change event payload
export interface TimelineColorChangeEvent {
  unique_id: string
}

// Timeline zoom event payload
export interface TimelineZoomEvent {
  zoom_level: number
}

// Timeline navigation event payload
export interface TimelineNavEvent {
  unique_id: string
}

// Error message interface
export interface Message {
  message_key: string
  message_data: any
}

// Timeline era interface (if needed)
export interface TimelineEra {
  unique_id?: string
  start_date?: Moment
  end_date?: Moment
  text?: {
    headline?: string
    text?: string
  }
  [key: string]: any
}

// Timeline era interface for raw input (before parsing)
export interface TimelineEraInput {
  unique_id?: string
  start_date?: RawDateInput
  end_date?: RawDateInput
  text?: {
    headline?: string
    text?: string
  }
  [key: string]: any
}

export interface TimeAxisOptions {
  optimal_tick_width: number
  height?: number
  font_size?: number
}

export interface Tick {
  position: number
  label: string
  type: 'major' | 'minor'
  date: Date
}


export interface TimeMarkerData {
  unique_id: string
  start_date: any
  end_date?: any
  headline: string
  text?: string
  media?: any
  background?: any
  display_date?: string
}

export interface TimeMarkerOptions {
  marker_height_min: number
  marker_width_min: number
  marker_padding: number
}
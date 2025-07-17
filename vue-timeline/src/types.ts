/**
 * TypeScript type definitions for the Vue Timeline application
 */

import type { Moment, MomentFormatSpecification } from 'moment'
import type moment from 'moment'
import type { DateRange } from 'moment-range'
import type { MergeDeep, SetRequired, Simplify } from 'type-fest'
// Raw date input interface (before parsing to moment)
export type RawDateInput = Record<'year' | 'month' | 'day' | 'hour' | 'minute' | 'second', string | number> | string | number | Date | null

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
  range?: DateRange
  text?: {
    headline?: string
    text?: string
  }
  media?: {
    url?: string
    caption?: string
    credit?: string
  }
  background?: {
    url?: string
    caption?: string
    credit?: string
    alt?: string
    color?: string
    text?: string
  }
  last?: boolean
}

// Timeline event interface for raw input (before parsing)
export interface TimelineEventInput {
  unique_id?: string
  start_date: RawDateInput
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
  events: SetRequired<TimelineEvent, 'unique_id' | 'start_date' | 'range'>[]
  eras?: SetRequired<TimelineEvent, 'unique_id' | 'start_date' | 'range'>[]
  scale?: 'human' | 'cosmological'
  [key: string]: any
}

// Timeline configuration options
export interface TimelineOptions {
  base_class?: string
  debug?: boolean
  default_bg_color?: { r: number, g: number, b: number } | string
  dragging?: boolean
  duration?: number
  ease?: Function
  font?: string
  has_groups?: boolean
  hash_bookmark?: boolean
  height: number
  initial_zoom: number
  is_embed?: boolean
  is_full_embed?: boolean
  language?: Language
  layout?: 'landscape' | 'portrait'
  map_type?: string
  marker_height_min: number
  marker_padding: number
  marker_width_min: number
  max_rows: number
  medium_size: number
  menubar_height: number
  optimal_tick_width: number
  scale_factor: number
  skinny_size: number
  slide_default_fade: string
  slide_padding_lr: number
  start_at_end: boolean
  start_at_slide?: number | string
  storyslider_height?: number
  theme?: string | null
  timenav_height_min?: number
  timenav_height_percentage?: number
  timenav_height?: number | null
  timenav_mobile_height_percentage?: number
  timenav_position?: 'top' | 'bottom'
  track_events?: string[]
  trackResize?: boolean
  use_bc?: boolean
  width: number
  zoom_sequence: number[]
}

// Slide interface for the StorySlider component
export type Slide = Simplify<TimelineEvent & {
  position: number
  id: string
  isTitle: boolean
  start_date_format?: string
  end_date_format?: string
}>

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

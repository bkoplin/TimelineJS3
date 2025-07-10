<script lang="ts" setup>
import type { Language, TimelineData, TimelineOptions } from '../../types'
import { useAnimation } from '../../composables/useAnimation'
import { useSwipable } from '../../composables/useSwipable'
import { useTimeScale } from '../../composables/useTimeScale'
import { TLError } from '../../core/TLError'
import { hexToRgb } from '../../core/Util'

// Define props and emits
const emit = defineEmits<{
  (e: 'loaded'): void
  (e: 'change', payload: { unique_id: string }): void
  (e: 'zoomtoggle', payload: { zoom: string, show: boolean }): void
  (e: 'visible_ticks_change', payload: { visible_ticks: any }): void
  (e: 'visibleTicksChange', payload: { visible_ticks: any }): void
}>()

const timelineStore = useTimelineStore()
// Setup reactive refs
const timenavEl = ref<HTMLDivElement | null>(null)
const lineEl = ref<HTMLDivElement | null>(null)
const sliderEl = ref<HTMLDivElement | null>(null)
const sliderBackgroundEl = ref<HTMLDivElement | null>(null)
const markerContainerMaskEl = ref<HTMLDivElement | null>(null)
const markerContainerEl = ref<HTMLDivElement | null>(null)
const markerItemContainerEl = ref<HTMLDivElement | null>(null)
const timeaxisBackgroundEl = ref<HTMLDivElement | null>(null)
const timeAxisRef = ref<GlobalComponents['TimeAxis'] | null>(null)

const { width, height } = useElementSize(timenavEl)
const ready = ref(false)
const _markers = ref<any[]>([])
const _eras = ref<any[]>([])
const _groups = ref<any[]>([])
const has_eras = ref(false)
const collapsed = ref(false)

// Timeline state
const current_id = ref('')
const current_focused_id = ref('')
const _calculated_row_height = ref(100)
const max_rows = ref(6)
const animate_css = ref(false)

// Objects
const timescale = ref<any>({})
const timeaxis = ref<any>({})
const animator = ref<any>(null)
const _swipable = ref<any>(null)
const ticks_change_timeout = ref<number | null>(null)

// Options with defaults
const defaultOptions = {
  width: 600,
  height: 600,
  duration: 1000,
  ease: 'easeInOutQuint', // Will need to import easing function
  has_groups: false,
  optimal_tick_width: 50,
  scale_factor: 2,
  marker_padding: 5,
  timenav_height_min: 150,
  marker_height_min: 30,
  marker_width_min: 100,
  zoom_sequence: [0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
}

// Merge options with props
const mergedOptions = ref({ ...defaultOptions, ...timelineStore.options })

// Create time axis options
const timeAxisOptions = computed(() => ({
  optimal_tick_width: mergedOptions.value.optimal_tick_width || 100,
  height: 60,
  font_size: 12,
}))

// Initialize on mount
onMounted(() => {
  _initLayout()
  _initEvents()
  _initData()
  updateDisplay()
  _onLoaded()
})

// Watch for data changes
watch(() => timelineStore.events, (_newData) => {
  if (ready.value) {
    // Update markers and other visuals based on data changes
    _initData()
  }
}, { deep: true })

// Watch for size changes
watch([width, height], () => {
  if (ready.value) {
    updateDisplay(width.value, height.value, false)
  }
})

// Component methods
function _(key: string): string {
  // Simple translation function - you can implement proper i18n here
  const translations: Record<string, string> = {
    aria_label_timeline_navigation: 'Timeline Navigation',
  }
  return translations[key] || key
}

// Public methods
function positionMarkers(fast?: boolean): void {
  // POSITION X
  for (let i = 0; i < _markers.value.length; i++) {
    const pos = timescale.value.getPositionInfo(i)
    if (fast) {
      _markers.value[i].setClass('tl-timemarker tl-timemarker-fast')
    }
    else {
      _markers.value[i].setClass('tl-timemarker')
    }
    _markers.value[i].setPosition({ left: pos.start })
    _markers.value[i].setWidth(pos.width)
  }
}

function updateDisplay(w?: number, h?: number, animate?: boolean): void {
  let reposition_markers = false
  if (w) {
    if (mergedOptions.value.width === 0 && w > 0) {
      reposition_markers = true
    }
    mergedOptions.value.width = w
  }
  if (h && h !== mergedOptions.value.height) {
    mergedOptions.value.height = h
    timescale.value = _getTimeScale()
  }

  // Size Markers
  _assignRowsToMarkers()

  // Size swipable area
  if (sliderBackgroundEl.value && sliderEl.value) {
    sliderBackgroundEl.value.style.width = `${timescale.value.getPixelWidth() + mergedOptions.value.width}px`
    sliderBackgroundEl.value.style.left = `${-(mergedOptions.value.width / 2)}px`
    sliderEl.value.style.width = `${timescale.value.getPixelWidth() + mergedOptions.value.width}px`
  }

  // Update Swipable constraint
  if (_swipable.value) {
    _swipable.value.updateConstraint({
      top: false,
      bottom: false,
      left: (mergedOptions.value.width / 2),
      right: -(timescale.value.getPixelWidth() - (mergedOptions.value.width / 2)),
    })
  }

  if (reposition_markers) {
    _drawTimeline()
  }
  // Go to the current slide
  goToId(current_id.value, true)
}

// TimeScale methods
function _getTimeScale(): any {
  // Set Max Rows
  let marker_height_min = 0
  try {
    marker_height_min = Number.parseInt(mergedOptions.value.marker_height_min.toString())
  }
  catch (e) {
    console.warn('Invalid value for marker_height_min option.')
    marker_height_min = 30
  }
  if (marker_height_min === 0) {
    console.warn('marker_height_min option must not be zero.')
    marker_height_min = 30
  }

  if (timeaxisBackgroundEl.value && timenavEl.value) {
    max_rows.value = Math.round((mergedOptions.value.height - timeaxisBackgroundEl.value.offsetHeight - mergedOptions.value.marker_padding) / marker_height_min)
    if (max_rows.value < 1) {
      max_rows.value = 1
    }

    // Return mock timescale object - you'll need to implement TimeScale class
    return {
      getPixelWidth: () => 1000,
      getPositionInfo: (i: number) => ({ start: i * 100, width: 90, row: Math.floor(i / 5) }),
      getNumberOfRows: () => max_rows.value,
      getGroupLabels: () => null,
      getMajorScale: () => 'year',
      getMinorScale: () => 'month',
      getPosition: (timestamp: number) => timestamp / 1000000,
    }
  }
  return {}
}

function _updateTimeScale(new_scale: number): void {
  mergedOptions.value.scale_factor = new_scale
  _updateDrawTimeline()
}

// Zoom methods
function zoomIn(): void {
  const new_scale = findNextGreater(mergedOptions.value.zoom_sequence, mergedOptions.value.scale_factor)
  setZoomFactor(new_scale)
}

function zoomOut(): void {
  const new_scale = findNextLesser(mergedOptions.value.zoom_sequence, mergedOptions.value.scale_factor)
  setZoomFactor(new_scale)
}

function setZoom(level: number): void {
  const zoom_factor = mergedOptions.value.zoom_sequence[level]
  if (typeof zoom_factor === 'number') {
    setZoomFactor(zoom_factor)
  }
  else {
    console.warn(`Invalid zoom level. Please use an index number between 0 and ${mergedOptions.value.zoom_sequence.length - 1}`)
  }
}

function setZoomFactor(factor: number): void {
  if (factor <= mergedOptions.value.zoom_sequence[0]) {
    emit('zoomtoggle', { zoom: 'out', show: false })
  }
  else {
    emit('zoomtoggle', { zoom: 'out', show: true })
  }

  if (factor >= mergedOptions.value.zoom_sequence[mergedOptions.value.zoom_sequence.length - 1]) {
    emit('zoomtoggle', { zoom: 'in', show: false })
  }
  else {
    emit('zoomtoggle', { zoom: 'in', show: true })
  }

  if (factor === 0) {
    console.warn('Zoom factor must be greater than zero. Using 0.1')
    factor = 0.1
  }
  mergedOptions.value.scale_factor = factor
  goToId(current_id.value, !_updateDrawTimeline(true), true)
}

// Group methods
function _createGroups(): void {
  _groups.value = []
  const group_labels = timescale.value.getGroupLabels()

  if (group_labels) {
    mergedOptions.value.has_groups = true
    for (let i = 0; i < group_labels.length; i++) {
      _createGroup(group_labels[i])
    }
  }
}

function _createGroup(group_label: any): void {
  // Mock group creation - you'll need to implement TimeGroup class
  const group = { label: group_label, data: { rows: 1 } }
  _addGroup(group)
  _groups.value.push(group)
}

function _addGroup(group: any): void {
  // Mock add group to container
  console.log('Adding group:', group)
}

function _positionGroups(): void {
  if (mergedOptions.value.has_groups && timeaxisBackgroundEl.value) {
    const available_height = (mergedOptions.value.height - timeaxisBackgroundEl.value.offsetHeight)
    const group_height = Math.floor((available_height / timescale.value.getNumberOfRows()) - mergedOptions.value.marker_padding)

    for (let i = 0, group_rows = 0; i < _groups.value.length; i++) {
      const group_y = Math.floor(group_rows * (group_height + mergedOptions.value.marker_padding))
      let group_hide = false
      if (group_y > (available_height - mergedOptions.value.marker_padding)) {
        group_hide = true
      }

      // Mock position group
      console.log(`Positioning group ${i} at y: ${group_y}, hide: ${group_hide}`)
      group_rows += _groups.value[i].data.rows
    }
  }
}

// Marker methods
function _addMarker(marker: any): void {
  // Mock add marker - you'll need to implement TimeMarker class
  console.log('Adding marker:', marker)
}

function _createMarker(data: any, n: number): void {
  // Mock marker creation
  const marker = {
    data,
    setClass: (className: string) => console.log('Setting class:', className),
    setPosition: (pos: any) => console.log('Setting position:', pos),
    setWidth: (width: number) => console.log('Setting width:', width),
    setHeight: (height: number) => console.log('Setting height:', height),
    setRowPosition: (y: number, h: number) => console.log('Setting row position:', y, h),
    setActive: (active: boolean) => console.log('Setting active:', active),
    setFocus: () => console.log('Setting focus'),
    getLeft: () => 100,
    ariaLabel: data.headline || '',
  }
  _addMarker(marker)
  if (n < 0) {
    _markers.value.push(marker)
  }
  else {
    _markers.value.splice(n, 0, marker)
  }
}

function _createMarkers(array: any[]): void {
  for (let i = 0; i < array.length; i++) {
    _createMarker(array[i], -1)
  }
}

function _removeMarker(marker: any): void {
  console.log('Removing marker:', marker)
}

function _destroyMarker(n: number): void {
  _removeMarker(_markers.value[n])
  _markers.value.splice(n, 1)
}

function _calculateMarkerHeight(h: number): number {
  return ((h / timescale.value.getNumberOfRows()) - mergedOptions.value.marker_padding)
}

function _calculateRowHeight(h: number): number {
  return (h / timescale.value.getNumberOfRows())
}

function _calculateAvailableHeight(): number {
  return (mergedOptions.value.height - (timeaxisBackgroundEl.value?.offsetHeight || 0) - mergedOptions.value.marker_padding)
}

function _calculateMinimumTimeNavHeight(): number {
  return (timescale.value.getNumberOfRows() * mergedOptions.value.marker_height_min) + (timeaxisBackgroundEl.value?.offsetHeight || 0) + mergedOptions.value.marker_padding
}

function getMinimumHeight(): number {
  return _calculateMinimumTimeNavHeight()
}

function _assignRowsToMarkers(): void {
  const available_height = _calculateAvailableHeight()
  const marker_height = _calculateMarkerHeight(available_height)

  _positionGroups()
  _calculated_row_height.value = _calculateRowHeight(available_height)

  for (let i = 0; i < _markers.value.length; i++) {
    // Set Height
    _markers.value[i].setHeight(marker_height)

    // Position by Row
    const row = timescale.value.getPositionInfo(i).row
    const marker_y = Math.floor(row * (marker_height + mergedOptions.value.marker_padding)) + mergedOptions.value.marker_padding
    const remainder_height = available_height - marker_y + mergedOptions.value.marker_padding
    _markers.value[i].setRowPosition(marker_y, remainder_height)
  }
}

function _resetMarkersActive(): void {
  for (let i = 0; i < _markers.value.length; i++) {
    _markers.value[i].setActive(false)
  }
}

function _resetMarkersBlurListeners(): void {
  // Mock implementation
  console.log('Resetting marker blur listeners')
}

function _findMarkerIndex(n: string | number): number {
  let _n = -1
  if (typeof n === 'string') {
    // Mock implementation - you'll need findArrayNumberByUniqueID utility
    for (let i = 0; i < _markers.value.length; i++) {
      if (_markers.value[i].data.unique_id === n) {
        _n = i
        break
      }
    }
  }
  return _n
}

// Era methods
function _createEras(array: any[]): void {
  for (let i = 0; i < array.length; i++) {
    const data = array[i]
    // Mock era creation - you'll need to implement TimeEra class
    const era = {
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      headline: data.headline,
      setClass: (className: string) => console.log('Era setting class:', className),
      setPosition: (pos: any) => console.log('Era setting position:', pos),
      setWidth: (width: number) => console.log('Era setting width:', width),
      setColor: (color: number) => console.log('Era setting color:', color),
    }
    _eras.value.push(era)
  }
}

function _positionEras(fast?: boolean): void {
  let era_color = 0
  for (let i = 0; i < _eras.value.length; i++) {
    const pos = {
      start: timescale.value.getPosition(_eras.value[i].start_date.getTime()),
      end: timescale.value.getPosition(_eras.value[i].end_date.getTime()),
      width: 0,
    }
    pos.width = pos.end - pos.start

    if (fast) {
      _eras.value[i].setClass('tl-timeera tl-timeera-fast')
    }
    else {
      _eras.value[i].setClass('tl-timeera')
    }
    _eras.value[i].setPosition({ left: pos.start })
    _eras.value[i].setWidth(pos.width)

    era_color++
    if (era_color > 5) {
      era_color = 0
    }
    _eras.value[i].setColor(era_color)
  }
}

// Public marker methods
function createMarker(d: any, n: number): void {
  _createMarker(d, n)
}

function createMarkers(array: any[]): void {
  _createMarkers(array)
}

function destroyMarker(n: number): void {
  _destroyMarker(n)
}

function destroyMarkerId(id: string): void {
  destroyMarker(_findMarkerIndex(id))
}

// Navigation methods
function goTo(n: number, fast?: boolean, css_animation?: boolean): void {
  const _n = (n < 0) ? 0 : n

  // Set Marker active state
  _resetMarkersActive()
  if (n >= 0 && n < _markers.value.length) {
    _markers.value[n].setActive(true)
  }

  animateMovement(_n, fast, css_animation, mergedOptions.value.duration, mergedOptions.value.ease)

  if (n >= 0 && n < _markers.value.length) {
    current_id.value = current_focused_id.value = _markers.value[n].data.unique_id
  }
  else {
    current_id.value = current_focused_id.value = ''
  }

  _setLabelWithCurrentMarker()
}

function goToId(id: string, fast?: boolean, css_animation?: boolean): void {
  goTo(_findMarkerIndex(id), fast, css_animation)
}

function focusOn(n: number, fast?: boolean, css_animation?: boolean): void {
  const _n = (n < 0) ? 0 : n

  animateMovement(_n, fast, css_animation, mergedOptions.value.duration, mergedOptions.value.ease)

  _resetMarkersBlurListeners()
  if (n >= 0 && n < _markers.value.length) {
    _markers.value[n].setFocus()
    current_focused_id.value = _markers.value[n].data.unique_id
  }
}

function focusNext(): void {
  const n = _findMarkerIndex(current_focused_id.value)
  if ((n + 1) < _markers.value.length) {
    focusOn(n + 1)
  }
  else {
    focusOn(n)
  }
}

function focusPrevious(): void {
  const n = _findMarkerIndex(current_focused_id.value)
  if (n - 1 >= 0) {
    focusOn(n - 1)
  }
  else {
    focusOn(n)
  }
}

function animateMovement(n: number, fast?: boolean, css_animation?: boolean, duration?: number, ease?: string): void {
  // Stop animation
  if (animator.value) {
    animator.value.stop()
  }

  if (fast && sliderEl.value) {
    sliderEl.value.style.left = `${-_markers.value[n].getLeft() + (mergedOptions.value.width / 2)}px`
  }
  else if (sliderEl.value) {
    if (css_animation) {
      animate_css.value = true
      sliderEl.value.style.left = `${-_markers.value[n].getLeft() + (mergedOptions.value.width / 2)}px`
    }
    else {
      // Mock animation - you'll need to implement Animate utility
      console.log('Animating to:', `${-_markers.value[n].getLeft() + (mergedOptions.value.width / 2)}px`)
    }
  }

  if (n >= 0 && n < _markers.value.length) {
    current_id.value = _markers.value[n].data.unique_id
  }
  else {
    current_id.value = ''
  }

  _dispatchVisibleTicksChange()
}

function _dispatchVisibleTicksChange(): void {
  if (ticks_change_timeout.value) {
    clearTimeout(ticks_change_timeout.value)
    ticks_change_timeout.value = null
  }
  ticks_change_timeout.value = setTimeout(() => {
    const visible_ticks = timeaxis.value.getVisibleTicks?.() || []
    emit('visible_ticks_change', { visible_ticks })
  }, mergedOptions.value.duration) as unknown as number
}

// Event handlers
function _onLoaded(): void {
  ready.value = true
  emit('loaded')
}

function _onMarkerClick(e: any): void {
  goToId(e.unique_id)
  emit('change', { unique_id: e.unique_id })
}

function _onMouseScroll(e: WheelEvent): void {
  let delta = 0
  let scroll_to = 0
  const constraint = {
    right: -(timescale.value.getPixelWidth() - (mergedOptions.value.width / 2)),
    left: mergedOptions.value.width / 2,
  }

  if (typeof (e as any).wheelDeltaX !== 'undefined') {
    delta = (e as any).wheelDeltaY / 6
    if (Math.abs((e as any).wheelDeltaX) > Math.abs((e as any).wheelDeltaY)) {
      delta = (e as any).wheelDeltaX / 6
    }
    else {
      delta = 0
    }
  }

  if (delta) {
    e.preventDefault()
  }

  if (sliderEl.value) {
    scroll_to = Number.parseInt(sliderEl.value.style.left.replace('px', '')) + delta

    if (scroll_to > constraint.left) {
      scroll_to = constraint.left
    }
    else if (scroll_to < constraint.right) {
      scroll_to = constraint.right
    }

    if (animate_css.value) {
      animate_css.value = false
    }

    sliderEl.value.style.left = `${scroll_to}px`
  }
}

function _onDragMove(): void {
  if (animate_css.value && sliderEl.value) {
    animate_css.value = false
  }
}

function _onKeydown(e: KeyboardEvent): void {
  e.stopPropagation()

  switch (e.key) {
    case 'ArrowUp':
    case 'ArrowRight':
      focusNext()
      break
    case 'ArrowDown':
    case 'ArrowLeft':
      focusPrevious()
      break
    case 'Home':
      focusOn(0)
      break
    case 'End':
      focusOn(_markers.value.length - 1)
      break
  }
}

// Private methods
function _drawTimeline(fast?: boolean): void {
  timescale.value = _getTimeScale()
  // Mock timeaxis draw - you'll need to implement TimeAxis class
  console.log('Drawing timeline ticks')
  positionMarkers(fast)
  _assignRowsToMarkers()
  _createGroups()
  _positionGroups()

  if (has_eras.value) {
    _positionEras(fast)
  }
}

function _updateDrawTimeline(check_update?: boolean): boolean {
  let do_update = false

  if (check_update) {
    // Mock timescale comparison
    do_update = true
  }
  else {
    do_update = true
  }

  if (do_update) {
    timescale.value = _getTimeScale()
    console.log('Positioning timeline ticks')
    positionMarkers()
    _assignRowsToMarkers()
    _positionGroups()
    if (has_eras.value) {
      _positionEras()
    }
    updateDisplay()
  }
  else {
    _drawTimeline(true)
  }

  return do_update
}

function _setLabelWithCurrentMarker(): void {
//   const currentMarker = _markers.value[_findMarkerIndex(current_focused_id.value)]
//   const currentMarkerText = currentMarker && currentMarker.ariaLabel
//     ? `, ${currentMarker.ariaLabel}, shown`
//     : ''
//   if (timenavEl.value) {
//     timenavEl.value.setAttribute('aria-label', `Timeline navigation ${currentMarkerText}`)
//   }
}

function _initLayout(): void {
  // Initialize layout elements - elements are already created via template refs
  if (timenavEl.value && timeAxisRef.value) {
    // Mock TimeAxis creation - you'll need to implement TimeAxis class
    timeaxis.value = {
      drawTicks: () => console.log('Drawing ticks'),
      positionTicks: () => console.log('Positioning ticks'),
      getVisibleTicks: () => [],
    }

    // Mock Swipable creation - you'll need to implement Swipable class
    if (sliderBackgroundEl.value && sliderEl.value) {
      _swipable.value = {
        enable: () => console.log('Enabling swipe'),
        updateConstraint: (constraint: any) => console.log('Updating constraint:', constraint),
        on: (event: string, handler: Function) => console.log('Adding swipe listener:', event),
      }
      _swipable.value.enable()
    }
  }
}

function _initEvents(): void {
  // Setup event listeners
  useEventListener(timenavEl, 'click', _onMarkerClick)
  useEventListener(timenavEl, 'wheel', _onMouseScroll)
  useEventListener(timenavEl, 'keydown', _onKeydown)

  // Mock swipable events
  if (_swipable.value) {
    _swipable.value.on('dragmove', _onDragMove)
  }
}

function _initData(): void {
  // Create Markers and then add them
  if (timelineStore?.events) {
    _createMarkers(timelineStore.events)
  }

  if (timelineStore?.eras && timelineStore.eras.length > 0) {
    has_eras.value = true
    _createEras(timelineStore.eras)
  }

  _drawTimeline()
}

// Utility functions - you'll need to implement these
function findNextGreater(sequence: number[], current: number): number {
  for (const value of sequence) {
    if (value > current)
      return value
  }
  return sequence[sequence.length - 1]
}

function findNextLesser(sequence: number[], current: number): number {
  for (let i = sequence.length - 1; i >= 0; i--) {
    if (sequence[i] < current)
      return sequence[i]
  }
  return sequence[0]
}

// Expose public methods
defineExpose({
  ready,
  collapsed,
  current_id,
  current_focused_id,
  max_rows,
  timescale,
  timeaxis,
  getMinimumHeight,
  positionMarkers,
  updateDisplay,
  zoomIn,
  zoomOut,
  setZoom,
  setZoomFactor,
  createMarker,
  createMarkers,
  destroyMarker,
  destroyMarkerId,
  goTo,
  goToId,
  focusOn,
  focusNext,
  focusPrevious,
  animateMovement,
})
</script>

<template>
  <!-- .tl-timenav -->
  <div
    ref="timenavEl"
    class="w-[100%] bg-[#f2f2f2] relative overflow-hidden border-t-1px border-t-solid border-t-[#e5e5e5] direction-ltr"
    style="border-top-color: var(--ui-background-color);"
    tabindex="0"
    role="application"
    :aria-label="_('aria_label_timeline_navigation')"
    aria-description="Navigate between markers with arrow keys. Press 'Home' for the first and 'End' for the last markers"
  >
    <!-- .tl-timenav-line -->
    <div
      ref="lineEl"
      class="absolute top-0 left-[50%] w-1px h-[100%] bg-[#d9d9d9] z-2"
      style="background-color: var(--ui-background-color);"
    />
    <!-- .tl-timenav-slider -->
    <div
      ref="sliderEl"
      class="absolute h-[100%] w-[100%] top-0"
    >
      <!-- .tl-timenav-slide-background -->
      <div
        ref="sliderBackgroundEl"
        class="absolute h-[100%] w-[100%] cursor-move z-6"
      />
      <!-- .tl-timenav-container-mask -->
      <div
        ref="markerContainerMaskEl"
        class="absolute h-[100%] top-0"
      >
        <!-- .tl-timenav-container -->
        <div
          ref="markerContainerEl"
          class="absolute h-full"
        >
          <!-- .tl-timenav-item-container -->
          <div
            ref="markerItemContainerEl"
            class="absolute h-full"
          />
        </div>
      </div>
      <TimeNavTimeAxis
        ref="timeAxisRef"
        :options="timeAxisOptions"
        :language="language"
        :timescale="timescale"
        @visible-ticks-change="(payload) => emit('visibleTicksChange', payload)"
      />
    </div>
    <!-- .tl-timenav-timeaxis-background -->
    <div
      ref="timeaxisBackgroundEl"
      class="h-39px w-[100%] absolute bottom-0 left-0 bg-[#FFF] border-t-1px solid #e5e5e5 z-2"
    />
  </div>
</template>

<style>
</style>

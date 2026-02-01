/**
 * Timeline State Management Composable
 * Manages timeline state in an immutable way
 */
import { ref, computed, readonly, shallowRef } from 'vue'
import type { TimelineData, TimelineEvent, TimelineEra, TimelineTitle, TimelineOptions } from '@/types/timeline'

export function useTimelineState(initialData?: TimelineData, options?: TimelineOptions) {
  // Deep clone to prevent mutations
  const cloneData = <T>(data: T): T => JSON.parse(JSON.stringify(data))
  
  // Internal state (mutable)
  const _data = shallowRef<TimelineData>(initialData ? cloneData(initialData) : { events: [] })
  const _currentSlideIndex = ref(options?.start_at_slide ?? 0)
  const _isReady = ref(false)
  const _isLoading = ref(false)
  
  // Public readonly state
  const data = computed(() => readonly(_data.value))
  const events = computed(() => readonly(_data.value.events))
  const title = computed(() => _data.value.title ? readonly(_data.value.title) : undefined)
  const eras = computed(() => _data.value.eras ? readonly(_data.value.eras) : undefined)
  const currentSlideIndex = computed(() => _currentSlideIndex.value)
  const isReady = computed(() => _isReady.value)
  const isLoading = computed(() => _isLoading.value)
  
  /**
   * Set new timeline data (immutable)
   */
  function setData(newData: TimelineData) {
    _data.value = cloneData(newData)
  }
  
  /**
   * Update current slide
   */
  function setCurrentSlide(index: number) {
    if (index >= 0 && index < getTotalSlides()) {
      _currentSlideIndex.value = index
    }
  }
  
  /**
   * Get total number of slides (including title if present)
   */
  function getTotalSlides(): number {
    const eventCount = _data.value.events.length
    return _data.value.title ? eventCount + 1 : eventCount
  }
  
  /**
   * Get event by index (0-based, excludes title)
   */
  function getEvent(index: number): TimelineEvent | undefined {
    return _data.value.events[index]
  }
  
  /**
   * Get event by unique_id
   */
  function getEventById(id: string): TimelineEvent | undefined {
    return _data.value.events.find(e => e.unique_id === id)
  }
  
  /**
   * Add a new event (creates immutable copy)
   */
  function addEvent(event: TimelineEvent): void {
    const newEvents = [..._data.value.events, cloneData(event)]
    _data.value = { ..._data.value, events: newEvents }
  }
  
  /**
   * Remove event by index
   */
  function removeEvent(index: number): void {
    const newEvents = _data.value.events.filter((_, i) => i !== index)
    _data.value = { ..._data.value, events: newEvents }
  }
  
  /**
   * Remove event by id
   */
  function removeEventById(id: string): void {
    const newEvents = _data.value.events.filter(e => e.unique_id !== id)
    _data.value = { ..._data.value, events: newEvents }
  }
  
  /**
   * Add an era
   */
  function addEra(era: TimelineEra): void {
    const currentEras = _data.value.eras || []
    const newEras = [...currentEras, cloneData(era)]
    _data.value = { ..._data.value, eras: newEras }
  }
  
  /**
   * Set ready state
   */
  function setReady(ready: boolean) {
    _isReady.value = ready
  }
  
  /**
   * Set loading state
   */
  function setLoading(loading: boolean) {
    _isLoading.value = loading
  }
  
  return {
    // Readonly state
    data,
    events,
    title,
    eras,
    currentSlideIndex,
    isReady,
    isLoading,
    
    // Actions
    setData,
    setCurrentSlide,
    getTotalSlides,
    getEvent,
    getEventById,
    addEvent,
    removeEvent,
    removeEventById,
    addEra,
    setReady,
    setLoading
  }
}

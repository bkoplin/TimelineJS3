import type { Ref } from 'vue'
import { useElementSize, useResizeObserver } from '@vueuse/core'
import { nextTick, ref } from 'vue'

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

export function useTimeAxis(
  element: Ref<HTMLElement | null>,
  options: Ref<TimeAxisOptions>,
  language: any,
) {
  const { width, height } = useElementSize(element)
  const ticks = ref<Tick[]>([])
  const visibleTicks = ref<Tick[]>([])

  // Watch for element resize and update ticks
  useResizeObserver(element, () => {
    updateVisibleTicks()
  })

  // Draw ticks on the timeline
  function drawTicks(timescale: any, optimal_tick_width: number): void {
    if (!element.value) {
      return
    }

    // Clear existing ticks
    element.value.innerHTML = ''
    ticks.value = []

    const pixelWidth = timescale.getPixelWidth()
    const numberOfTicks = Math.floor(pixelWidth / optimal_tick_width)
    
    // Generate ticks based on timeline scale
    generateTicks(timescale, numberOfTicks)
    
    // Render ticks in DOM
    renderTicks()
    
    // Update visible ticks
    nextTick(() => {
      updateVisibleTicks()
    })
  }

  // Position existing ticks (for performance when scale doesn't change)
  function positionTicks(timescale: any, _optimal_tick_width: number): void {
    if (!element.value) {
      return
    }

    // Update tick positions without regenerating
    updateTickPositions(timescale)
    updateVisibleTicks()
  }

  // Generate tick data
  function generateTicks(timescale: any, numberOfTicks: number): void {
    const majorScale = timescale.getMajorScale()
    const minorScale = timescale.getMinorScale()
    const pixelWidth = timescale.getPixelWidth()
    
    // Create mock date range for ticks
    const startDate = new Date(2020, 0, 1)
    const endDate = new Date(2024, 11, 31)
    const dateRange = endDate.getTime() - startDate.getTime()
    
    for (let i = 0; i <= numberOfTicks; i++) {
      const ratio = i / numberOfTicks
      const position = ratio * pixelWidth
      const tickDate = new Date(startDate.getTime() + (ratio * dateRange))
      
      // Determine if this is a major or minor tick
      const isMajorTick = i % 5 === 0 // Every 5th tick is major
      
      ticks.value.push({
        position,
        label: formatTickLabel(tickDate, isMajorTick ? majorScale : minorScale),
        type: isMajorTick ? 'major' : 'minor',
        date: tickDate,
      })
    }
  }

  // Render ticks in DOM
  function renderTicks(): void {
    if (!element.value) {
      return
    }

    ticks.value.forEach((tick) => {
      const tickElement = document.createElement('div')
      tickElement.className = `tl-timeaxis-tick tl-timeaxis-tick-${tick.type}`
      tickElement.style.position = 'absolute'
      tickElement.style.left = `${tick.position}px`
      
      const labelElement = document.createElement('span')
      labelElement.className = 'tl-timeaxis-tick-label'
      labelElement.textContent = tick.label
      
      tickElement.appendChild(labelElement)
      if (element.value) {
        element.value.appendChild(tickElement)
      }
    })
  }

  // Update tick positions when timescale changes
  function updateTickPositions(timescale: any): void {
    if (!element.value) {
      return
    }

    const tickElements = element.value.querySelectorAll('.tl-timeaxis-tick')
    tickElements.forEach((tickEl, index) => {
      if (ticks.value[index]) {
        const position = timescale.getPosition(ticks.value[index].date.getTime())
        ;(tickEl as HTMLElement).style.left = `${position}px`
        ticks.value[index].position = position
      }
    })
  }

  // Update visible ticks based on current viewport
  function updateVisibleTicks(): void {
    if (!element.value) {
      return
    }

    const containerRect = element.value.getBoundingClientRect()
    const containerLeft = containerRect.left
    const containerRight = containerRect.right
    
    visibleTicks.value = ticks.value.filter((tick) => {
      const tickLeft = containerLeft + tick.position
      return tickLeft >= containerLeft && tickLeft <= containerRight
    })
  }

  // Format tick label based on scale
  function formatTickLabel(date: Date, scale: string): string {
    switch (scale) {
      case 'year':
        return date.getFullYear().toString()
      case 'month':
        return date.toLocaleDateString(language?.code || 'en', { month: 'short' })
      case 'day':
        return date.getDate().toString()
      case 'hour':
        return `${date.getHours()}:00`
      case 'decade':
        return `${Math.floor(date.getFullYear() / 10) * 10}s`
      default:
        return date.getFullYear().toString()
    }
  }

  // Get currently visible ticks
  function getVisibleTicks(): Tick[] {
    return visibleTicks.value
  }

  // Get all ticks
  function getAllTicks(): Tick[] {
    return ticks.value
  }

  return {
    // Reactive properties
    width,
    height,
    ticks,
    visibleTicks,
    
    // Methods
    drawTicks,
    positionTicks,
    updateVisibleTicks,
    getVisibleTicks,
    getAllTicks,
  }
}

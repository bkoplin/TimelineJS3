import type { TimelineData, TimelineEvent } from '@/types/timeline'

/**
 * Generate test timeline data for testing virtual scrolling with large datasets
 */
export function generateTestData(count: number): TimelineData {
  const events: TimelineEvent[] = []
  
  // Generate events spread across multiple years
  const startYear = 2000
  const yearsSpan = Math.min(count / 10, 50) // Distribute events across years
  
  for (let i = 0; i < count; i++) {
    const yearOffset = Math.floor((i / count) * yearsSpan)
    const monthOffset = (i % 12) + 1
    const dayOffset = (i % 28) + 1
    
    const event: TimelineEvent = {
      unique_id: `event-${i}`,
      start_date: {
        year: startYear + yearOffset,
        month: monthOffset,
        day: dayOffset
      },
      text: {
        headline: `Event ${i + 1}`,
        text: `This is test event number ${i + 1} of ${count}. ` +
              `Generated for testing virtual scrolling performance. ` +
              `Date: ${startYear + yearOffset}-${monthOffset.toString().padStart(2, '0')}-${dayOffset.toString().padStart(2, '0')}`
      },
      media: i % 5 === 0 ? {
        url: `https://via.placeholder.com/400x300?text=Event+${i + 1}`,
        caption: `Image for event ${i + 1}`
      } : undefined
    }
    
    events.push(event)
  }
  
  return {
    title: {
      text: {
        headline: `Virtual Scrolling Test: ${count} Events`,
        text: `This timeline contains ${count} events to test virtual scrolling performance. ` +
              `Virtual scrolling should automatically enable for datasets larger than 50 events.`
      }
    },
    events
  }
}

/**
 * Generate events with specific date patterns for testing
 */
export function generatePatternedData(count: number, pattern: 'linear' | 'clustered' | 'random' = 'linear'): TimelineData {
  const events: TimelineEvent[] = []
  const startYear = 2000
  
  for (let i = 0; i < count; i++) {
    let year: number, month: number, day: number
    
    switch (pattern) {
      case 'linear':
        // Evenly distributed
        year = startYear + Math.floor(i / 100)
        month = (i % 12) + 1
        day = (i % 28) + 1
        break
        
      case 'clustered':
        // Events clustered in certain years
        const cluster = Math.floor(i / 50)
        year = startYear + cluster * 10
        month = (i % 12) + 1
        day = (i % 28) + 1
        break
        
      case 'random':
        // Random distribution
        year = startYear + Math.floor(Math.random() * 50)
        month = Math.floor(Math.random() * 12) + 1
        day = Math.floor(Math.random() * 28) + 1
        break
    }
    
    events.push({
      unique_id: `event-${i}`,
      start_date: { year, month, day },
      text: {
        headline: `${pattern.charAt(0).toUpperCase() + pattern.slice(1)} Event ${i + 1}`,
        text: `Pattern: ${pattern}, Date: ${year}-${month}-${day}`
      }
    })
  }
  
  return {
    title: {
      text: {
        headline: `${pattern.charAt(0).toUpperCase() + pattern.slice(1)} Distribution: ${count} Events`,
        text: `Events distributed using ${pattern} pattern for testing.`
      }
    },
    events
  }
}

/**
 * Presets for common test scenarios
 */
export const testDataPresets = {
  small: () => generateTestData(10),
  medium: () => generateTestData(50),
  large: () => generateTestData(100),
  xlarge: () => generateTestData(500),
  huge: () => generateTestData(1000),
  extreme: () => generateTestData(5000),
  
  // Pattern-based
  linearLarge: () => generatePatternedData(1000, 'linear'),
  clusteredLarge: () => generatePatternedData(1000, 'clustered'),
  randomLarge: () => generatePatternedData(1000, 'random')
}

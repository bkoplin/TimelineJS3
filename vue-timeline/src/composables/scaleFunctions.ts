import type { ScaleTime } from 'd3-scale'
import { scaleTime } from 'd3-scale'
import { isArray } from 'radash'
import { Dayjs } from './useDayJs'

/**
 * @description Creates a D3 scale function that maps dates to pixel values.
 * @example
 * const scale = dateToPixelFn([0, 100, new Date(2020, 0, 1), new Date(2020, 0, 31)]);

 * @returns A D3 scale function that maps dates to pixel values.
 */
export function dateToPixelFn(arg1, arg2, arg3, arg4) {
  if (isHTMLElement(arg1) && isArray(arg2)) {
    const rect = arg1.getBoundingClientRect()
    return scaleTime().domain(arg2.toDate()).range([rect.left, rect.right])
  }
  else if (isArray(arg1) && isDayjsRange(arg2)) {
    return scaleTime().domain([arg2.start.toDate(), arg2.end.toDate()]).range(arg1)
  }
  else if (typeof arg1 === 'number' && typeof arg2 === 'number' && arg3 instanceof Date && arg4 instanceof Date) {
    return scaleTime().domain([arg3, arg4]).range([arg1, arg2])
  }
  else {
    return scaleTime()
  }
}

export function pixelToDateFn(...args: Parameters<typeof dateToPixelFn>): (pixel: number) => Dayjs {
  const scale = dateToPixelFn(...args)
  return (pixel: number): Dayjs => {
    const date = scale.invert(pixel)
    return dayjs(date) // Handle case where scale returns an array
  }
}

export const useDateToPixelFn = reactify(dateToPixelFn)
export const usePixelToDateFn = reactify(pixelToDateFn)

function isHTMLElement(obj: any): obj is HTMLElement {
  return obj && typeof obj === 'object' && 'getBoundingClientRect' in obj
}

function isDayjsRange(obj: any): obj is { start: Dayjs, end: Dayjs } {
  return obj && typeof obj === 'object' && 'start' in obj && 'end' in obj && obj.start instanceof Dayjs && obj.end instanceof Dayjs 
}

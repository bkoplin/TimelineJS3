import type { ScaleTime } from 'd3-scale'
import type { DateRange, Moment } from './useMoment'
import { scaleTime } from 'd3-scale'
import { isArray } from 'radash'
import { moment } from './useMoment'

/**
 * @description Creates a D3 scale function that maps dates to pixel values.
 * @example
 * const scale = dateToPixelFn([0, 100, new Date(2020, 0, 1), new Date(2020, 0, 31)]);
 * @param opts - Either an array of [pixelMin, pixelMax, dateMin, dateMax] or an object with pixelRange and momentRange properties.
 * @returns A D3 scale function that maps dates to pixel values.
 */
export function dateToPixelFn(pixelMin: null | number, pixelMax: number, dateMin: Date | Moment, dateMax: Date | Moment): ScaleTime<number, number>
export function dateToPixelFn(pixelRange: null | [number, number] | HTMLElement, momentRange: DateRange): ScaleTime<number, number>
export function dateToPixelFn(arg1: null | HTMLElement | number | [number, number], arg2: number | DateRange, arg3?: Date | Moment, arg4?: Date | Moment): ScaleTime<number, number> {
  if (isHTMLElement(arg1) && isMomentRange(arg2)) {
    const rect = arg1.getBoundingClientRect()
    return scaleTime().domain(arg2.toDate()).range([rect.left, rect.right])
  }
  else if (isArray(arg1) && isMomentRange(arg2)) {
    return scaleTime().domain(arg2.toDate()).range(arg1)
  }
  else if (typeof arg1 === 'number' && typeof arg2 === 'number' && arg3 instanceof Date && arg4 instanceof Date) {
    return scaleTime().domain([arg3, arg4]).range([arg1, arg2])
  }
  else {
    return scaleTime()
  }
}

export function pixelToDateFn(...args: Parameters<typeof dateToPixelFn>): (pixel: number) => Moment {
  const scale = dateToPixelFn(...args)
  return (pixel: number): Moment => {
    const date = scale.invert(pixel)
    return moment(date) // Handle case where scale returns an array
  }
}

export const useDateToPixelFn = reactify(dateToPixelFn)
export const usePixelToDateFn = reactify(pixelToDateFn)

function isHTMLElement(obj: any): obj is HTMLElement {
  return obj && typeof obj === 'object' && 'getBoundingClientRect' in obj
}

function isMomentRange(obj: any): obj is DateRange {
  return obj && typeof obj === 'object' && 'toDate' in (obj as DateRange) && typeof (obj as DateRange).toDate === 'function'
}

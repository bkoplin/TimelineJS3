import type { DateRange, MomentRange } from 'moment-range'
import type { Merge, Simplify } from 'type-fest'
import * as momentMoment from 'moment'
import { extendMoment } from 'moment-range'

export type { unitOfTime } from 'moment'

export const moment = extendMoment(momentMoment.default as unknown as Parameters<typeof extendMoment>[0]) as unknown as typeof momentMoment['default'] & MomentRange

export const useMomentMethods = reactifyObject(moment)

export const useMomentRange = reactify(moment.range)
import type { DateRange, MomentRange } from 'moment-range'
import type { Merge, Simplify } from 'type-fest'
import * as momentMoment from 'moment'
import { extendMoment } from 'moment-range'

export type { unitOfTime } from 'moment'

export const moment = extendMoment(momentMoment) as unknown as Merge<typeof momentMoment, MomentRange>

export const useMomentMethods = reactifyObject(moment)

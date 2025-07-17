import type { DateRange, MomentRange, MomentRangeStaticMethods } from 'moment-range'
import type { Merge, Simplify } from 'type-fest'
import * as momentMoment from 'moment'
import { extendMoment } from 'moment-range'

// export interface Moment = MomentRangeStaticMethods & momentMoment.Moment & { isRange: (range: any) => boolean, within: (range: DateRange) => boolean } & typeof momentMoment
export type Moment = Simplify<MomentRangeStaticMethods & momentMoment.Moment>
export type { DateRange }
export type { unitOfTime } from 'moment'

export const moment = extendMoment(momentMoment.default as unknown as Parameters<typeof extendMoment>[0]) as unknown as MomentRange & typeof momentMoment;

export const useMomentMethods = reactifyObject(moment)

export const useMomentRange = reactify(moment.range)

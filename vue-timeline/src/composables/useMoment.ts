import type { DateRange, MomentRange } from 'moment-range'
import momentMoment from 'moment'
import { extendMoment } from 'moment-range'

export type { unitOfTime } from 'moment'

export const moment = extendMoment(momentMoment) as unknown as ReturnType<typeof momentMoment> & MomentRange

export const useMomentMethods = reactifyObject(moment)

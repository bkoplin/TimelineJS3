import { default as momentMoment } from 'moment'
import { extendMoment } from 'moment-range'

export const moment = extendMoment(momentMoment)

export const useMomentMethods = reactifyObject(moment)

import { BIG_DATE_SCALES, SCALES } from '../date/TLDate'
import TLError from '../core/TLError'

/*  AxisHelper
    Strategies for laying out the timenav
    markers and time axis
    Intended as a private class -- probably only known to TimeScale
    Get them using the exported getBestHelper function
================================================== */
class AxisHelper {
  constructor(options) {
    if (options) {
      this.scale = options.scale
	        this.minor = options.minor
	        this.major = options.major
    }
    else {
      throw new TLError('axis_helper_no_options_err')
    }
  }

  getPixelsPerTick(pixels_per_milli) {
    return pixels_per_milli * this.minor.factor
  }

  getMajorTicks(timescale) {
    return this._getTicks(
      timescale, this.major,
    )
  }

  getMinorTicks(timescale) {
    return this._getTicks(
      timescale, this.minor,
    )
  }

  _getTicks(
    timescale, option,
  ) {
    const factor_scale = timescale._scaled_padding * option.factor
    const first_tick_time = timescale._earliest - factor_scale
    const last_tick_time = timescale._latest + factor_scale
    const ticks = []
    for (let i = first_tick_time; i < last_tick_time; i += option.factor)
      ticks.push(timescale.getDateFromTime(i).floor(option.name))

    return {
      name: option.name,
      ticks,
    }
  }
}
const HELPERS = {}

const setHelpers = function (
  scale_type, scales,
) {
  HELPERS[scale_type] = []

  for (let idx = 0; idx < scales.length - 1; idx++) {
    const minor = scales[idx]
    const major = scales[idx + 1]
    HELPERS[scale_type].push(new AxisHelper({
      scale: minor[3],
      minor: { name: minor[0], factor: minor[1] },
      major: { name: major[0], factor: major[1] },
    }))
  }
}

setHelpers(
  'human', SCALES,
)
setHelpers(
  'cosmological', BIG_DATE_SCALES,
)

export function getBestHelper(
  ts, optimal_tick_width,
) {
  if (typeof (optimal_tick_width) != 'number')
    optimal_tick_width = 100

  const ts_scale = ts.getScale()
  const helpers = HELPERS[ts_scale]

  if (!helpers) {
    throw new TLError(
      'axis_helper_scale_err', ts_scale,
    )
  }

  let prev = null
  for (let idx = 0; idx < helpers.length; idx++) {
    const curr = helpers[idx]
    const pixels_per_tick = curr.getPixelsPerTick(ts._pixels_per_milli)
    if (pixels_per_tick > optimal_tick_width) {
      if (prev == null)
        return curr
      const curr_dist = Math.abs(optimal_tick_width - pixels_per_tick)
      const prev_dist = Math.abs(optimal_tick_width - pixels_per_tick)
      if (curr_dist < prev_dist)
        return curr

      else
        return prev
    }
    prev = curr
  }
  return helpers[helpers.length - 1] // last resort
}

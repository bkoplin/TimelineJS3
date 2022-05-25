import type { StringKeyOf } from 'type-fest'
import { ValueOf } from 'type-fest'
import axios from 'axios'

import { forOwn, padStart } from 'lodash'
import type { F, O, S } from 'ts-toolbelt'
import { trace } from '../core/Util'
import type { BigYear } from '../date/TLDate'
import type { DateObject } from '../timeline/Timeline.d'
import { LANGUAGES } from './LANGUAGES'

const pad = (
  val: string | number, len = 2,
) => padStart(
`${val}`, len, '0',
)

type LANGUAGE_TYPE = typeof LANGUAGES['en']

export class Language<T extends LANGUAGE_TYPE = LANGUAGE_TYPE> {
  [index: StringKeyOf<T>]: ValueOf<T>
  static fallback: LANGUAGE_TYPE = LANGUAGES.en
  static DATE_FORMAT_TOKENS = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g

  /**
     * Instantiate a Language object to manage I18N.
     * WARNING: In general, this should not be called directly, because it doesn't block while
     * the language file is loaded, which can lead to race conditions in some cases. In most
     * cases, language objects other than the fallback should be gotten by calling the
     * async function loadLanguage defined elsewhere in this file.
     *
     * @param [language] - a language code or a URL to a
     *     translation file
     * @param [script_path] - if `language` is not a URL, this is used
     *     to construct a fully-qualified URL to load a translation file.
     */
  constructor(
    language: StringKeyOf<typeof LANGUAGES> = 'en', script_path?: string,
  ) {
    // borrowed from http://stackoverflow.com/a/14446414/102476
    if (typeof LANGUAGES[language] === 'undefined') {
      loadLanguage(
        language, script_path,
      )
    }
    else {
      forOwn(
        LANGUAGES[language], (
          v, k,
        ) => { this[k] = v },
      )
    }
  }

  formatBigYear(
    this: LANGUAGE_TYPE, bigyear: InstanceType<typeof BigYear>, format_name: keyof LANGUAGE_TYPE['bigdateformats'] = 'fallback',
  ): string {
    const the_year = bigyear.year
    const format_list = this.bigdateformats[format_name] ?? this.bigdateformats.fallback

    if (format_list) {
      for (let i = 0; i < format_list.length; i++) {
        const tuple = format_list[i]
        if (Math.abs(the_year / tuple[0]) > 1) {
          // will we ever deal with distant future dates?
          return formatNumber(
            Math.abs(the_year / tuple[0]), tuple[1],
          )
        }
      }

      return the_year.toString()
    }
    else {
      trace('Language file dateformats missing cosmological. Falling back.')
      return formatNumber(
        the_year, format_name,
      )
    }
  }

  _(
    this: LANGUAGE_TYPE, k: keyof LANGUAGE_TYPE['messages'],
  ): string {
    return this.messages[k] || Language.fallback.messages[k] || k
  }

  formatDate(
    date: InstanceType<typeof Date> | InstanceType<typeof BigYear> | { data: { date_obj: DateObject } }, format_name: keyof LANGUAGE_TYPE['bigdateformats'] = 'fallback',
  ): string {
    if (date instanceof Date) {
      return this.formatJSDate(
        date, format_name,
      )
    }

    else if ('year' in date) {
      return this.formatBigYear(
        date, format_name,
      )
    }

    else if (typeof date?.data?.date_obj !== 'undefined') {
      return this.formatDate(
        date?.data?.date_obj, format_name,
      )
    }

    trace('Unfamiliar date presented for formatting')
    return date.toString()
  }

  formatJSDate(
    this: LANGUAGE_TYPE,
    js_date: Date, format_name: keyof LANGUAGE_TYPE['dateformats'] = 'full',
  ): string {
    // ultimately we probably want this to work with TLDate instead of (in addition to?) JS Date
    // utc, timezone and timezoneClip are carry over from Steven Levithan implementation. We probably aren't going to use them.
    const formatPeriod = (
      fmt: keyof LANGUAGE_TYPE['period_labels'], value: number,
    ) => {
      const formats = this.period_labels[fmt]
      if (formats)
        var fmt = (value < 12) ? formats[0] : formats[1]

      return `<span class='tl-timeaxis-timesuffix'>${fmt}</span>`
    }

    const utc = false
    const timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g
    const timezoneClip = /[^-+\dA-Z]/g

    if (!format_name)
      format_name = 'full'

    let mask = this.dateformats[format_name] || Language.fallback.dateformats[format_name]
    if (!mask)
      mask = format_name // allow custom format strings

    const _ = utc ? 'getUTC' : 'get'
    const d = js_date[`${_}Date`]()
    const D = js_date[`${_}Day`]()
    const m = js_date[`${_}Month`]()
    const y = js_date[`${_}FullYear`]()
    const H = js_date[`${_}Hours`]()
    const M = js_date[`${_}Minutes`]()
    const s = js_date[`${_}Seconds`]()
    const L = js_date[`${_}Milliseconds`]()
    const o = utc ? 0 : js_date.getTimezoneOffset()
    const year = ''
    const flags = {
      d,
      dd: pad(d),
      ddd: this.date.day_abbr[D],
      dddd: this.date.day[D],
      m: m + 1,
      mm: pad(m + 1),
      mmm: this.date.month_abbr[m],
      mmmm: this.date.month[m],
      yy: String(y).slice(2),
      yyyy: (y < 0 && this.has_negative_year_modifier()) ? Math.abs(y) : y,
      h: H % 12 || 12,
      hh: pad(H % 12 || 12),
      H,
      HH: pad(H),
      M,
      MM: pad(M),
      s,
      ss: pad(s),
      l: pad(
        L, 3,
      ),
      L: pad(L > 99 ? Math.round(L / 10) : L),
      t: formatPeriod(
        't', H,
      ),
      tt: formatPeriod(
        'tt', H,
      ),
      T: formatPeriod(
        'T', H,
      ),
      TT: formatPeriod(
        'TT', H,
      ),
      Z: utc
        ? 'UTC'
        : (String(js_date).match(timezone) || ['']).pop().replace(
            timezoneClip, '',
          ),
      o: (o > 0 ? '-' : '+') + pad(
        Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4,
      ),
      S: ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
    }

    const formatted: string = mask.replace(
      Language.DATE_FORMAT_TOKENS, ($0) => {
        return $0 in flags
          ? flags[$0]
          : $0.slice(
            1, $0.length - 1,
          )
      },
    )

    return this._applyEra(
      formatted, y,
    )
  }

  has_negative_year_modifier(this: LANGUAGE_TYPE): boolean {
    return Boolean(this.era_labels.negative_year.prefix || this.era_labels.negative_year.suffix)
  }

  _applyEra(
    formatted_date: string, original_year: number,
  ): string {
    // trusts that the formatted_date was property created with a non-negative year if there are
    // negative affixes to be applied
    const labels = (original_year < 0) ? this.era_labels.negative_year : this.era_labels.positive_year
    let result = ''
    if (labels.prefix)
      result += `<span>${labels.prefix}</span> `
    result += formatted_date
    if (labels.suffix)
      result += ` <span>${labels.suffix}</span>`
    return result
  }
}

/**
 * Provide an async factory method for loading languages that clarifies the need to wait
 * for the language data to be loaded, so that other code doesn't press ahead before the language
 * is available.
 *
 *
 * @param language_code - a language code or a fully-qualified URL to a language JSON file
 * @param script_path - a URL prefix which can be used to construct a fully-qualified URL to a language file using `language_code`
 * @returns an instance of Language, or null if there's an error loading the translation file
 *
 */
export async function loadLanguage(
  language_code: keyof typeof LANGUAGES | 'en', script_path: string,
): Promise<InstanceType<typeof Language>> {
  const url = buildLanguageURL(
    language_code, script_path,
  )
  try {
    if (typeof LANGUAGES?.[language_code] === 'undefined') {
      const { data: json } = await axios.get(url)
      LANGUAGES[language_code] = json
    }
    return new Language(
      language_code, script_path,
    )
  }
  catch (e) {
    console.log(`Error loading language [${url}] ${e.statusText}`)
    return null
  }
}

function buildLanguageURL(
  code: string, script_path: string,
) {
  let url = ''
  if (/\.json$/.test(code)) {
    url = code
  }
  else {
    let fragment = `/locale/${code}.json`
    if (/\/$/.test(script_path))
      fragment = fragment.substr(1)
    url = script_path + fragment
  }
  return url
}

function formatNumber(
  val, mask,
) {
  if (mask.match(/%(\.(\d+))?f/)) {
    const match = mask.match(/%(\.(\d+))?f/)
    const token = match[0]
    if (match[2])
      val = val.toFixed(match[2])

    return mask.replace(
      token, val,
    )
  }
  // use mask as literal display value.
  return mask
}

export const fallback = Language.fallback

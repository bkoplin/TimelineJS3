import { generateUniqueId, trace } from './Util'
import { TLError } from './TLError'
import { DateParser } from './DateParser'
import type { TimelineEvent, TimelineEra, TimelineData, Message, RawDateInput } from '../types'

/**
 * TimelineConfig is the configuration object for a timeline. It wraps a 
 * data object with accessors that add some behaviors to the data. 
 * If initial data is provided as a parameter, it is sanitized/validated 
 * and loaded into the object. 
 * The TimelineConfig data object contains:
 * @property {Array} events - An array of event objects
 * @property {Object} title - An object which has the title for the timeline (optional)
 * @property {Object} eras - An array of era objects (optional)
 * @property {Object} scale - which type of scale to use (human or cosmological)
 */
export class TimelineConfig {
  title: TimelineEvent | null = null;
  scale: 'human' | 'cosmological' = 'human';
  events: TimelineEvent[] = [];
  eras: TimelineEra[] = [];
  event_dict: { [key: string]: TimelineEvent } = {};
  messages: {
    errors: Message[];
    warnings: Message[];
  } = {
    errors: [],
    warnings: []
  };

  constructor(data?: TimelineData) {
    // Validate and process the data
    if (data) {
      this._processSingleDate(data)
    }
  }

  /**
   * Process data, sanitizing and adding properties as appropriate.
   */
  private _processSingleDate(data: TimelineData) {
    let events: TimelineEvent[] = [], eras: TimelineEra[] = []

    // Validate the data structure
    if (typeof data !== 'object' || !data) {
      throw new TLError("data_structure_invalid_data", data)
    }

    // Handle events and eras
    if (data.events) {
      events = this._ensureValidEventsList(data.events)
    }

    if (data.eras) {
      eras = this._ensureValidErasList(data.eras)
    }

    // Set scale
    this.scale = data.scale || 'human'

    // Process title slide
    if (data.title) {
      const title: TimelineEvent = { ...data.title }
      const title_id = this._assignID(title)
      this._tidyField(title)
      this._parseDates(title, data.title)
      this.title = title
      this.event_dict[title_id] = this.title
    }

    // Process events
    for (const event of events) {
      this.addEvent(event, true)
    }

    // Process eras
    for (const era of eras) {
      this.addEra(era)
    }

    // Sort
    this._sortEvents()

    if (this.events.length > 0) {
      this.events[this.events.length - 1].last = true
    }
  }

  /**
   * Ensures events are in the correct format
   */
  private _ensureValidEventsList(events: any): TimelineEvent[] {
    if (!events) {
      return []
    }
    
    // Make sure it's an array
    if (typeof events === 'string' || !Array.isArray(events)) {
      throw new TLError("data_structure_invalid_events", events)
    }

    // Return the events
    return events
  }

  /**
   * Ensures eras are in the correct format
   */
  private _ensureValidErasList(eras: any): TimelineEra[] {
    if (!eras) {
      return []
    }
    
    // Make sure it's an array
    if (typeof eras === 'string' || !Array.isArray(eras)) {
      throw new TLError("data_structure_invalid_eras", eras)
    }
    
    // Return the eras
    return eras
  }

  /**
   * Sort events by date
   */
  private _sortEvents() {
    this.events.sort((a, b) => {
      if (!a.start_date) {
        trace(`No start date for ${a.text?.headline}`)
        return -1
      }
      if (!b.start_date) {
        trace(`No start date for ${b.text?.headline}`)
        return 1
      }
      return a.start_date.valueOf() - b.start_date.valueOf()
    })
  }

  /**
   * Add an event to the events array and event_dict object
   */
  addEvent(rawData: any, suppress_sort?: boolean): string {
    const data: TimelineEvent = { ...rawData }
    const event_id = this._assignID(data)

    this._tidyField(data)
    this._parseDates(data, rawData)

    this.events.push(data)
    this.event_dict[event_id] = data

    if (!suppress_sort) {
      this._sortEvents()
    }

    return event_id
  }

  /**
   * Add an era to the eras array
   */
  addEra(rawData: any): string {
    const data: TimelineEra = { ...rawData }
    const event_id = this._assignID(data)
    this._tidyField(data)
    this._parseDates(data, rawData)
    this.eras.push(data)
    return event_id
  }

  /**
   * Given an event, make sure the fields are correct and complete
   */
  private _tidyField(d: TimelineEvent | TimelineEra) {
    if (!d.text) {
      d.text = {}
    }
    if (!d.text.text) {
      d.text.text = ""
    }
    if (!d.text.headline) {
      d.text.headline = ""
    }
    
    // Media validation
    if ('media' in d && !d.media) {
      d.media = {}
    }
  }

  /**
   * Given an item, return its ID, making sure to assign one if it doesn't have one
   */
  private _assignID(data: TimelineEvent | TimelineEra): string {
    let id = data.unique_id
    if (!id) {
      id = data.unique_id = generateUniqueId(6)
    }
    return id
  }

  /**
   * Parse dates in an event or era
   */
  private _parseDates(data: TimelineEvent | TimelineEra, rawData: any) {
    // Parse start_date
    if (rawData.start_date) {
      try {
        data.start_date = DateParser.parseDate(rawData.start_date)
      } catch (error) {
        this.logError("invalid_start_date_err", rawData.start_date)
      }
    }

    // Parse end_date
    if (rawData.end_date) {
      try {
        data.end_date = DateParser.parseDate(rawData.end_date)
      } catch (error) {
        this.logError("invalid_end_date_err", rawData.end_date)
      }
    }
  }

  /**
   * Check if any properties are invalid and log if so
   */
  validate() {
    // Check for valid scale
    if (this.scale !== 'human' && this.scale !== 'cosmological') {
      this.logError("scale_invalid_scale", this.scale)
    }

    // Check events
    for (const event of this.events) {
      if (!event.start_date) {
        this.logError("missing_start_date_err", event)
      }

      if (typeof(event.unique_id) !== 'string') {
        this.logError("invalid_unique_id_err", event)
      }

      if (event.end_date && 
          event.start_date && 
          DateParser.isAfter(event.start_date, event.end_date)) {
        this.logError("invalid_date_err", event)
      }
    }
  }

  /**
   * Check if any critical properties are invalid
   */
  isValid(): boolean {
    this.messages.errors = []
    this.validate() // Re-run validation to populate errors
    return this.messages.errors.length === 0
  }

  /**
   * Log an error
   */
  logError(msg_key: string, msg_data: any) {
    trace(`logError: ${msg_key} (${msg_data})`)
    this.messages.errors.push({ message_key: msg_key, message_data: msg_data })
  }

  /**
   * Get all errors
   */
  getErrors(): Message[] {
    return this.messages.errors
  }
}

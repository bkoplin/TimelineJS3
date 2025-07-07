import { generateUniqueId, trace } from './Util'
import { TLError } from './TLError'

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
  constructor(data) {
    // Initialize the object properties
    this.title = null
    this.scale = 'human'
    this.events = []
    this.eras = []
    this.event_dict = {}
    this.messages = {
      errors: [],
      warnings: []
    }

    // Validate and process the data
    if (data) {
      this._processSingleDate(data)
    }
  }

  /**
   * Process data, sanitizing and adding properties as appropriate.
   */
  _processSingleDate(data) {
    let events = [], eras = []

    // Validate the data structure
    if (typeof data != 'object' || !data) {
      throw new TLError("data_structure_invalid_data")
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
      const title_id = this._assignID(data.title)
      this._tidyField(data.title)
      this.title = data.title
      this.event_dict[title_id] = this.title
    }

    // Process events
    for (let i = 0; i < events.length; i++) {
      this.addEvent(events[i], true)
    }

    // Process eras
    for (let i = 0; i < eras.length; i++) {
      this.addEra(eras[i])
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
  _ensureValidEventsList(events) {
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
  _ensureValidErasList(eras) {
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
  _sortEvents() {
    this.events.sort(function(a, b) {
      if (!a.start_date) {
        trace(`No start date for ${a.text.headline}`)
        return -1
      }
      if (!b.start_date) {
        trace(`No start date for ${b.text.headline}`)
        return 1
      }
      return a.start_date.data.sort_date - b.start_date.data.sort_date
    })
  }

  /**
   * Add an event to the events array and event_dict object
   */
  addEvent(data, suppress_sort) {
    const event_id = this._assignID(data)

    this._tidyField(data)

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
  addEra(data) {
    const event_id = this._assignID(data)
    this._tidyField(data)
    this.eras.push(data)
    return event_id
  }

  /**
   * Given an event, make sure the fields are correct and complete
   */
  _tidyField(d) {
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
    if (!d.media) {
      d.media = {}
    }
  }

  /**
   * Given an item, return its ID, making sure to assign one if it doesn't have one
   */
  _assignID(data) {
    let id = data.unique_id
    if (!id) {
      id = data.unique_id = generateUniqueId(6)
    }
    return id
  }

  /**
   * Check if any properties are invalid and log if so
   */
  validate() {
    // Check for valid scale
    if (this.scale != 'human' && this.scale != 'cosmological') {
      this.logError("scale_invalid_scale", this.scale)
    }

    // Check events
    for (let i = 0; i < this.events.length; i++) {
      if (!this.events[i].start_date) {
        this.logError("missing_start_date_err", this.events[i])
      }

      if (typeof(this.events[i].unique_id) !== 'string') {
        this.logError("invalid_unique_id_err", this.events[i])
      }

      if (this.events[i].end_date && 
          this.events[i].start_date && 
          this.events[i].start_date.isBefore(this.events[i].end_date)) {
        this.logError("invalid_date_err", this.events[i])
      }
    }
  }

  /**
   * Check if any critical properties are invalid
   */
  isValid() {
    this.messages.errors = []
    return this.messages.errors.length === 0
  }

  /**
   * Log an error
   */
  logError(msg_key, msg_data) {
    trace(`logError: ${msg_key} (${msg_data})`)
    this.messages.errors.push({ message_key: msg_key, message_data: msg_data })
  }

  /**
   * Get all errors
   */
  getErrors(pretty) {
    return this.messages.errors
  }
}

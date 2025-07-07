/**
 * Events class for enabling event-driven components
 */
export default class Events {
  constructor() {
    this._listeners = {};
  }

  /**
   * Add an event listener
   * @param {string} eventName - The name of the event to listen for
   * @param {function} callback - The callback function to call when the event is triggered
   * @param {object} [context] - The context to bind the callback function to
   */
  on(eventName, callback, context) {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    this._listeners[eventName].push({
      callback: callback,
      context: context || this
    });
    return this;
  }

  /**
   * Remove an event listener
   * @param {string} eventName - The name of the event to remove the listener from
   * @param {function} [callback] - The callback function to remove
   * @param {object} [context] - The context of the callback function to remove
   */
  off(eventName, callback, context) {
    if (!this._listeners[eventName]) {
      return this;
    }
    if (!callback) {
      delete this._listeners[eventName];
      return this;
    }
    
    context = context || this;
    
    for (let i = 0; i < this._listeners[eventName].length; i++) {
      if (this._listeners[eventName][i].callback === callback && 
          this._listeners[eventName][i].context === context) {
        this._listeners[eventName].splice(i, 1);
        i--;
      }
    }
    
    if (this._listeners[eventName].length === 0) {
      delete this._listeners[eventName];
    }
    
    return this;
  }

  /**
   * Fire an event
   * @param {string} eventName - The name of the event to fire
   * @param {object} [data] - Data to pass to the event listeners
   * @param {object} [context] - The context to use when calling the event listeners
   */
  fire(eventName, data, context) {
    if (!this._listeners[eventName]) {
      return this;
    }
    
    const listeners = this._listeners[eventName].slice();
    
    for (let i = 0; i < listeners.length; i++) {
      listeners[i].callback.call(listeners[i].context || context || this, data);
    }
    
    return this;
  }
}

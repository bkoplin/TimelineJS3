import * as DOM from '../dom/DOM'

/**
 * Message display for Timeline
 */
export default class Message {
  constructor(container, options = {}) {
    this._el = {
      container: container,
      message_container: {},
      message: {}
    }
    
    this.options = {
      message_class: "tl-message",
      message_icon_class: "tl-message-icon"
    }
    
    // Merge options
    Object.assign(this.options, options)
    
    // Initialize the message
    this._init()
  }
  
  /**
   * Initialize the message component
   */
  _init() {
    // Create message container
    this._el.message_container = DOM.create('div', this.options.message_class)
    
    // Create message icon
    this._el.message = DOM.create('div', 'tl-message-content', this._el.message_container)
    
    // Add to container
    this._el.container.appendChild(this._el.message_container)
    
    // Hide by default
    this.hide()
  }
  
  /**
   * Update the message
   */
  updateMessage(t) {
    this._el.message.innerHTML = t || ""
    // Make visible
    this._el.message_container.style.display = "block"
  }
  
  /**
   * Update the message display
   */
  updateDisplay(width, height) {
    // Do nothing for now - can be enhanced later
  }
  
  /**
   * Hide the message
   */
  hide() {
    this._el.message_container.style.display = "none"
  }
  
  /**
   * Show the message
   */
  show() {
    this._el.message_container.style.display = "block"
  }
  
  /**
   * Set the language for the message
   */
  setLanguage(language) {
    // Do nothing - just maintain API compatibility
  }
  
  /**
   * Remove the message from its container
   */
  removeFrom(container) {
    container.removeChild(this._el.message_container)
  }
}

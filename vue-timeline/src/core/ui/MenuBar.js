import Events from '../Events'
import * as DOM from '../dom/DOM'

/**
 * MenuBar class for the timeline menu bar component
 */
export class MenuBar extends Events {
  constructor(elem, parent_elem, options, language) {
    super()
    
    this._el = {
      container: elem,
      parent: parent_elem
    }
    
    this.options = options
    this.language = language
    
    this._init()
  }
  
  /**
   * Initialize the MenuBar component
   */
  _init() {
    this._initLayout()
    this._initEvents()
  }
  
  /**
   * Initialize the layout of the MenuBar component
   */
  _initLayout() {
    // Create zoom buttons
    this._el.zoomin = DOM.create('div', 'tl-menubar-button tl-menubar-button-zoomin', this._el.container)
    this._el.zoomout = DOM.create('div', 'tl-menubar-button tl-menubar-button-zoomout', this._el.container)
    this._el.back_to_start = DOM.create('div', 'tl-menubar-button tl-menubar-button-backtostart', this._el.container)
    this._el.forward_to_end = DOM.create('div', 'tl-menubar-button tl-menubar-button-forwardtoend', this._el.container)
    
    // Add button labels
    this._el.zoomin.innerHTML = this.language.messages.zoom_in
    this._el.zoomout.innerHTML = this.language.messages.zoom_out
    this._el.back_to_start.innerHTML = this.language.messages.return_to_title
    this._el.forward_to_end.innerHTML = this.language.messages.go_to_end
  }
  
  /**
   * Initialize events for the MenuBar component
   */
  _initEvents() {
    DOM.on(this._el.zoomin, 'click', this._onZoomIn, this)
    DOM.on(this._el.zoomout, 'click', this._onZoomOut, this)
    DOM.on(this._el.back_to_start, 'click', this._onBackToStart, this)
    DOM.on(this._el.forward_to_end, 'click', this._onForwardToEnd, this)
  }
  
  /**
   * Handle zoom in button click
   */
  _onZoomIn(e) {
    this.fire('zoom_in', e)
  }
  
  /**
   * Handle zoom out button click
   */
  _onZoomOut(e) {
    this.fire('zoom_out', e)
  }
  
  /**
   * Handle back to start button click
   */
  _onBackToStart(e) {
    this.fire('back_to_start', e)
  }
  
  /**
   * Handle forward to end button click
   */
  _onForwardToEnd(e) {
    this.fire('forward_to_end', e)
  }
  
  /**
   * Toggle the zoom in button
   */
  toogleZoomIn(show) {
    this._el.zoomin.style.display = show ? 'block' : 'none'
  }
  
  /**
   * Toggle the zoom out button
   */
  toogleZoomOut(show) {
    this._el.zoomout.style.display = show ? 'block' : 'none'
  }
  
  /**
   * Update visible ticks
   */
  changeVisibleTicks(visible_ticks) {
    // Implementation for updating visible ticks
  }
}

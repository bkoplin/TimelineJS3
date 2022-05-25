/*	Message

================================================== */
import { TLClass } from '../core/TLClass'
import { classMixin, mergeData } from '../core/Util'
import * as DOM from '../dom/DOM'
import Events from '../core/Events'
import { DOMMixins } from '../dom/DOMMixins'
import { DOMEvent } from '../dom/DOMEvent'
import { I18NMixins } from '../language/I18NMixins'

interface MessageOptions {
  width: number
  height: number
  message_class: string
  message_icon_class: string
}

/**
 * A class for displaying messages to users.
 */
export default class Message {
  _el: { parent: {}; container: {}; message_container: {}; loading_icon: {}; message: {} }
  options: MessageOptions
  container: HTMLElement
  animator: {}
  /**
     * Initialize a Message object with the container where it appears and,
     *     optionally, a JS object of options.
     * @param {HTMLElement} container
     * @param {object} [options]
     */
  constructor(
    container: HTMLElement, options: MessageOptions, language,
  ) {
    if (language)
      this.setLanguage(language)

    // DOM ELEMENTS
    this._el = {
      parent: {},
      container: {},
      message_container: {},
      loading_icon: {},
      message: {},
    }

    // Options
    this.options = {
      width: 600,
      height: 600,
      message_class: 'tl-message',
      message_icon_class: 'tl-loading-icon',
    }

    this.container = container

    mergeData(
      this.options, options,
    )

    this._el.container = DOM.create(
      'div',
      this.options.message_class,
    )

    if (container) {
      container.appendChild(this._el.container)
      this._el.parent = container
    }

    // Animation
    this.animator = {}

    this._initLayout()
    this._initEvents()
  }

  setLanguage(language: any) {
    throw new Error('Method not implemented.')
  }

  updateMessage(t) {
    if (!t)
      this._el.message.innerHTML = this._('loading')

    else
      this._el.message.innerHTML = t

    // Re-add to DOM?
    if (
      !this._el.parent.atributes
            && this.container.attributes
    ) {
      this.container.appendChild(this._el.container)
      this._el.parent = this.container
    }
  }

  _(arg0: string): any {
    throw new Error('Method not implemented.')
  }

  /*	Update Display
================================================== */
  updateDisplay(
    w, h,
  ) {
    // no-op but probably should be implemented
  }

  _onMouseClick() {
    this.fire(
      'clicked', this.options,
    )
  }

  fire(
    arg0: string, options: any,
  ) {
    throw new Error('Method not implemented.')
  }

  _onRemove() {
    this._el.parent = {}
  }

  _initLayout() {
    // Create Layout
    this._el.message_container = DOM.create(
      'div',
      'tl-message-container',
      this._el.container,
    )
    this._el.loading_icon = DOM.create(
      'div',
      this.options.message_icon_class,
      this._el.message_container,
    )
    this._el.message = DOM.create(
      'div',
      'tl-message-content',
      this._el.message_container,
    )

    this.updateMessage()
  }

  _initEvents() {
    DOMEvent.addListener(
      this._el.container, 'click', this._onMouseClick, this,
    )
    DOMEvent.addListener(
      this, 'removed', this._onRemove, this,
    )
  }
}
classMixin(
  Message, I18NMixins, Events, DOMMixins,
)

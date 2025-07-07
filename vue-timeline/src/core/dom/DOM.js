/**
 * DOM Helper utilities
 */

/**
 * Get an element by ID or element
 */
export function get(id) {
  if (typeof id === 'string') {
    return document.getElementById(id);
  }
  return id;
}

/**
 * Create a DOM element
 */
export function create(tagName, className = '', parent = null) {
  const el = document.createElement(tagName);
  if (className) {
    el.className = className;
  }
  if (parent) {
    parent.appendChild(el);
  }
  return el;
}

/**
 * Add an event listener to an element
 */
export function on(element, eventType, callback, useCapture = false) {
  element.addEventListener(eventType, callback, useCapture);
  return {
    remove: function() {
      element.removeEventListener(eventType, callback, useCapture);
    }
  };
}

/**
 * Remove an event listener from an element
 */
export function off(element, eventType, callback, useCapture = false) {
  element.removeEventListener(eventType, callback, useCapture);
}

/**
 * Appends an element to a parent
 */
export function append(parent, element) {
  parent.appendChild(element);
  return element;
}

/**
 * Remove all children from an element
 */
export function removeChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  return element;
}

/**
 * Tracer for debugging
 */
export function trace(msg) {
  if (console) {
    console.log(msg);
  }
}

let trace_handlers = [];
export function addTraceHandler(f) {
  trace_handlers.push(f);
}

/**
 * Deep merge for JSON objects
 */
export function mergeData(obj1, obj2) {
  for (let attrname in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, attrname)) {
      obj1[attrname] = obj2[attrname];
    }
  }
  return obj1;
}

/**
 * Mix properties of source into destination object.
 */
export function classMixin(destination, source) {
  for (let prop in source) {
    if (Object.prototype.hasOwnProperty.call(source, prop)) {
      destination[prop] = source[prop];
    }
  }
}

/**
 * Convert hex color to rgb
 */
export function hexToRgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Generate a unique id
 */
export function generateUniqueId(len = 10) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < len; i++) {
    id += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return id;
}

/**
 * Transform a date into a string
 */
export function transformDateFormat(dateString) {
  return new Date(dateString).toDateString();
}

/**
 * Check if value is true
 */
export function isTrue(value) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return false;
}

/**
 * Add element class(es)
 */
export function addClass(element, className) {
  const classes = className.split(' ');
  for (let i = 0; i < classes.length; i++) {
    if (element.classList) {
      element.classList.add(classes[i]);
    } else {
      element.className += ' ' + classes[i];
    }
  }
}

/**
 * Remove element class(es)
 */
export function removeClass(element, className) {
  const classes = className.split(' ');
  for (let i = 0; i < classes.length; i++) {
    if (element.classList) {
      element.classList.remove(classes[i]);
    } else {
      element.className = element.className.replace(new RegExp('(^|\\b)' + classes[i].split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  }
}

/**
 * Determine if element has class
 */
export function hasClass(element, className) {
  if (element.classList) {
    return element.classList.contains(className);
  } else {
    return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
  }
}

/**
 * Add a handler for window resize
 */
export function addResizeHandler(callback) {
  let timeout;
  
  const onResize = () => {
    clearTimeout(timeout);
    timeout = setTimeout(callback, 100);
  };
  
  window.addEventListener('resize', onResize);
  
  return {
    remove: () => window.removeEventListener('resize', onResize)
  };
}

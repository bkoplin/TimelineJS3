/**
 * Browser detection and features
 */

// Browser environment detection
export const isIE = () => 
  navigator.userAgent.indexOf('MSIE') !== -1 || 
  navigator.appVersion.indexOf('Trident/') > -1;

export const isEdge = () => 
  navigator.userAgent.indexOf('Edge') !== -1;

export const isMobile = /Mobi/.test(navigator.userAgent);
export const touch = 'ontouchstart' in window || 
  window.DocumentTouch && document instanceof window.DocumentTouch;

/**
 * Get orientation of device
 */
export function orientation() {
  if (window.innerHeight > window.innerWidth) {
    return "portrait";
  } else {
    return "landscape";
  }
}

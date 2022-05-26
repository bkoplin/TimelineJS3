/*	DomUtil
	Inspired by Leaflet
	DomUtil contains various utility functions for working with DOM
	Why are they in DOMUtil and not DOM?
================================================== */

function hasClass(
  el: HTMLElement, name: string,
): boolean {
  return el.className.length > 0 && new RegExp(`(^|\\s)${name}(\\s|$)`).test(el.className)
}

export function addClass(
  el: HTMLElement, name: string,
): void {
  if (!hasClass(
    el, name,
  ))
    el.className += (el.className ? ' ' : '') + name
}

export function removeClass(
  el: HTMLElement, name: string,
): void {
  el.className = el.className.replace(
    /(\S+)\s*/g, (
      w, match,
    ) => {
      if (match === name)
        return ''

      return w
    },
  ).replace(
    /^\s+/, '',
  )
}

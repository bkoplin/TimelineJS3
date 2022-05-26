import * as Browser from '../core/Browser'
const TRANSITION = testProp(['transition', 'webkitTransition', 'OTransition', 'MozTransition', 'msTransition'])
const TRANSFORM = testProp(['transformProperty', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform'])

const TRANSLATE_OPEN = `translate${Browser.webkit3d ? '3d(' : '('}`
const TRANSLATE_CLOSE = Browser.webkit3d ? ',0)' : ')'
function get(id?: string): HTMLElement | null | undefined {
  return (typeof id === 'string' ? document.getElementById(id) : id)
}

function getByClass(id?: string): HTMLCollectionOf<Element> | undefined {
  if (id)
    return document.getElementsByClassName(id)
}

function create(
  tagName: string, className: string, container?: HTMLElement,
): HTMLElement {
  const el = document.createElement(tagName)
  el.className = className
  if (container)
    container.appendChild(el)

  return el
}

function createText(
  content: string, container: HTMLElement,
): Text {
  const el = document.createTextNode(content)
  if (container)
    container.appendChild(el)

  return el
}

function getTranslateString(point: { x: number; y: number }): string {
  return `${TRANSLATE_OPEN}${point.x}px,${point.y}px${TRANSLATE_CLOSE}`
}

function setPosition(
  el: HTMLElement, point: { x: number; y: number },
) {
  el._tl_pos = point
  if (Browser.webkit3d) {
    el.style[TRANSFORM] = getTranslateString(point)

    if (Browser.android) {
      el.style['-webkit-perspective'] = '1000'
      el.style['-webkit-backface-visibility'] = 'hidden'
    }
  }
  else {
    el.style.left = `${point.x}px`
    el.style.top = `${point.y}px`
  }
}

function getPosition(inputEl: HTMLElement) {
  const pos = {
    x: 0,
    y: 0,
  }
  let el = inputEl
  while (el !== null && !isNaN(el?.offsetLeft) && !isNaN(el?.offsetTop)) {
    pos.x += el.offsetLeft// - el.scrollLeft;
    pos.y += el.offsetTop// - el.scrollTop;
    el = el.offsetParent
  }
  return pos
}

function testProp(props) {
  const style = document.documentElement.style

  for (let i = 0; i < props.length; i++) {
    if (props[i] in style)
      return props[i]
  }
  return false
}

export { get, create, getPosition }

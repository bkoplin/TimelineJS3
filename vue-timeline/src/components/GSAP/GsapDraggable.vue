<script lang="ts" setup>
import type { gsap } from '@/composables/useGsap'
import { Draggable } from '@/composables/useGsap'

// Define props that match Draggable.Vars interface
interface Props {
  /**
   * The cursor's CSS value that should be used between the time they press and then release the pointer/mouse. This can be different than the regular cursor value, like: cursor: "grab", activeCursor: "grabbing".
   */
  activeCursor?: string
  /**
   * Draggable will allow context menus (like if a user right-clicks or long-touches). Normally this is suppressed because it can get in the way of dragging (especially on touch devices).
   * @default false
   */
  allowContextMenu?: boolean
  /**
   * If true, preventDefault() won't be called on the original mouse/pointer/touch event. This can be useful if you want to permit the default behavior like touch-scrolling. Typically, however, it's best to let Draggable call preventDefault() on the events in order to deliver the best usability with dragging.
   * @default false.
   */
  allowEventDefault?: boolean
  /**
   * By default, allows you to native touch-scroll in the opposite direction as Draggables that are limited to one axis . For example, a Draggable of type: "x" or "left" would permit native touch-scrolling in the vertical direction, and type: "y" or "top" would permit native horizontal touch-scrolling.
   * @default true
   */
  allowNativeTouchScrolling?: boolean
  /**
   * To enable auto-scrolling when a Draggable is dragged within 40px of an edge of a scrollable container, set autoScroll to a non-zero value, where `1` is normal speed, `2` is double-speed, etc. (you can use any number). For a more intuitive or natural feel, it will scroll faster as the mouse/touch gets closer to the edge. The default value is `0` (no auto-scrolling).
   * @default 0
   * @see {@link https://codepen.io/GreenSock/pen/YPvdYv/?editors=001|this CodePen}
   */
  autoScroll?: number
  /**
   * To cause the draggable element to stay within the bounds of another DOM element (like a container), you can pass the element like bounds: `document.getElementById("container")` or even selector text like `"#container"`. If you prefer, you can define bounds as a rectangle instead, like bounds: `{top: 100, left: 0, width: 1000, height: 800}` which is based on the parent’s coordinate system (top and left would be from the upper left corner of the parent). Or you can define specific maximum and minimum values like bounds: `{minX: 10, maxX: 300, minY: 50, maxY: 500}` or bounds: `{minRotation: 0, maxRotation: 270}`.
   * @example document.getElementById("container")
   * @example "#container"
   * @example {top: 100, left: 0, width: 1000, height: 800}
   * @example {minX: 10, maxX: 300, minY: 50, maxY: 500}
   * @example {minRotation: 0, maxRotation: 270}
   */
  bounds?: gsap.DOMTarget | Draggable.BoundsMinMax | Draggable.BoundsRectangle | Draggable.BoundsRotation
  /**
   * The scope to be used for all of the callbacks (onDrag, onDragEnd, onDragStart, etc). The scope is what this refers to inside any of the callbacks. The older callback-specific scope properties are deprecated but still work.
   * @see onClick
   * @see onDrag
   * @see onDragEnd
   * @see onDragStart
   * @see onMove
   * @see onPress
   * @see onRelease
   * @see onThrowComplete
   * @see onThrowUpdate
   * @see onLockAxis
   * @default Draggable
   */
  callbackScope?: object
  /**
   * Your Draggable may contain child elements that are “clickable”, like links `<a>` tags, `<button/>` or `<input>` elements, etc. By default, it treats clicks and taps on those elements differently, not allowing the user to drag them. You can set dragClickables: true to override that, but it still may be handy to control exactly what Draggable considers to be a “clickable” element, so you can use your own function that accepts the clicked-on element as the only parameter and returns true or false accordingly. Draggable will call this function whenever the user presses their mouse or finger down on a Draggable, and the target of that event will be passed to your clickableTest function.
   */
  clickableTest?: (element: HTMLElement | SVGElement) => void
  /**
   * By default (except for type: "rotation"), the cursor CSS property of the element is set to move so that when the mouse rolls over it, there’s a visual cue indicating that it’s moveable, but you may define a different cursor if you prefer like cursor: "pointer".
   * @see {@link https://devdocs.io/css/cursor|CSS Cursor documentation}
   * @default "move"
   */
  cursor?: string
  /**
   * By default, Draggable will work on pretty much any element, but sometimes you might want clicks on `<a>`, `<input>`, `<select>`, `<button>`, and `<textarea>` elements (as well as any element that has a `data-clickable="true"` attribute) NOT to trigger dragging so that the browser's default behavior fires (like clicking on an input would give it focus and drop the cursor there to begin typing), so if you want Draggable to ignore those clicks and allow the default behavior instead, set `dragClickables: false`.
   * @default true
   */
  dragClickables?: boolean
  /**
   * A number between 0 and 1 that controls the degree to which resistance is constantly applied to the element as it is dragged, where 1 won't allow it to be dragged at all, 0.75 applies a lot of resistance (making the object travel at quarter-speed), and 0.5 would be half-speed, etc. This can even apply to rotation.
   * @default 0
   */
  dragResistance?: number
  /**
   * A number between 0 and 1 that controls the degree to which resistance is applied to the element as it goes outside the bounds (if any are applied), where 1 won't allow it to be dragged past the bounds at all, 0.75 applies a lot of resistance (making the object travel at quarter-speed beyond the border while dragging), and 0.5 would be half-speed beyond the border, etc. This can even apply to rotation.
   * @default 0
   */
  edgeResistance?: number
  /**
   * By default, 3D transforms are used (when the browser supports them) in order to force the element onto its own layer on the GPU, thus speeding compositing. Typically this provides the best performance, but you can disable it by setting `force3D: false`. This may be a good idea if the element that you're dragging contains child elements that are animating.
   * @default true
   */
  force3D?: 'auto' | boolean
  /**
   * InertiaPlugin is the key to getting the momentum-based motion after the users' mouse (or touch) is released. To have Draggable auto-apply an InertiaPlugin tween to the element when the mouse is released (or touch ends), you can set `inertia: true` (`inertia` also works). Or for advanced effects, you can define the actual inertia object that will get fed into tween, like `inertia: {top: {min: 0, max: 1000, end: [0,200,400,600]}}`. However, if you want ultimate control over the InertiaPlugin tween, you can simply use an `onDragEnd` to call your own function that creates the tween. If `inertia: true` is defined, you may also use any of the following configuration properties that apply to the movement after the mouse/touch is released...
   * @default false
   * @example true
   * @example {top: {min: 0, max: 1000, end: [0,200,400,600]}}
   */
  inertia?: boolean | gsap.InertiaVars
  /**
   * Allows you to define rules that get applied **WHILE** the element is being dragged (whereas regular snap affects only the end value(s), where the element lands after the drag is released). For example, maybe you want the rotation to snap to 10-degree increments while dragging or you want the x and y values to snap to a grid (whichever cell is closest). You can define the `liveSnap` in any of the following ways:
   * @default false
   */
  liveSnap?: boolean | Draggable.SnapValue | Draggable.SnapObject
  /**
   * If `true`, dragging more than 2 pixels in either direction (horizontally or vertically) will lock movement into that axis so that the element can only be dragged that direction (horizontally or vertically, whichever had the most initial movement) during that drag. No diagonal movement will be allowed. Obviously this is only applicable for Draggables with a `type` of `"x,y"`, or `"top,left"`. If you only want to allow vertical movement, you should set the `type` to `"y"` or `"top"`. If you only want to allow horizontal movement, you should set the `type` to `"x"` or `"left"`.
   * @default false
   */
  lockAxis?: boolean
  /**
   * For InertiaPlugin only: defines the maximum duration (in seconds) that the momentum-based movement can last when `inertia` is enabled. For example, `maxDuration: 3` would ensure that the momentum-based movement lasts no longer than 3 seconds.
   * @see inertia
   * @example 3
   */
  maxDuration?: number
  /**
   * For InertiaPlugin only: defines the minimum duration (in seconds) that the momentum-based movement should last when `inertia` is enabled. For example, `minDuration: 0.2` would ensure that the momentum-based movement lasts at least 0.2 seconds even if the velocity is very low.
   * @see inertia
   * @example 0.2
   */
  minDuration?: number
  /**
   * By default, Draggable requires that the Draggable element moves more than 2 pixels in order to be interpreted as a drag, but you can change that threshold using `minimumMovement`. So `minimumMovement: 6` would require that the Draggable element moves more than 6 pixels to be interpreted as a drag.
   * @default 2
   * @example 6
   */
  minimumMovement?: number
  /**
   * A function that should be called only when the mouse/touch is pressed on the element and released without moving 3 pixels or more. This makes it easier to discern the user's intent (click or drag). Inside that function, `this` refers to the Draggable instance (unless you specifically set the scope using `callbackScope`), making it easy to access the target element (`this.target`) or the boundary coordinates (`this.maxX`, `this.minX`, `this.maxY`, and `this.minY`). By default, the `pointerEvent` (last mouse or touch event related to the Draggable) will be passed as the only parameter to the callback so that you can, for example, access its `pageX`, `pageY`, `target`, `currentTarget`, etc.
   * @see callbackScope
   */
  onClick?: (this: Draggable, event: PointerEvent) => void | null
  /**
   * An optional array of parameters to feed the `onClick` callback. For example, `onClickParams: ["clicked", 5]` would work with this code: `onClick: function(message, num) { console.log("message: " + message + ", num: " + num); }`.
   * @see onClick
   * @example ["clicked", 5]
   */
  onClickParams?: any[]
  /**
   * A function that should be called every time the mouse (or touch) moves during the drag. Inside that function, `this` refers to the Draggable instance (unless you specifically set the scope using `callbackScope`), making it easy to access the target element (`this.target`) or the boundary coordinates (`this.maxX`, `this.minX`, `this.maxY`, and `this.minY`). By default, the `pointerEvent` (last mouse or touch event related to the Draggable) will be passed as the only parameter to the callback so that you can, for example, access its `pageX`, `pageY`, `target`, `currentTarget`, etc. This is only called once per requestAnimationFrame.
   * @see callbackScope
   */
  onDrag?: (this: Draggable, event: PointerEvent) => void | null
  /**
   * An optional array of parameters to feed the `onDrag` callback. For example, `onDragParams: ["dragged", 5]` would work with this code: `onDrag: function(message, num) { console.log("message: " + message + ", num: " + num); }`.
   * @see onDrag
   * @example ["dragged", 5]
   */
  onDragParams?: any[]
  /**
   * A function that should be called as soon as the mouse (or touch) moves more than 2 pixels, meaning that dragging has begun. Inside that function, `this` refers to the Draggable instance (unless you specifically set the scope using `callbackScope`), making it easy to access the target element (`this.target`) or the boundary coordinates (`this.maxX`, `this.minX`, `this.maxY`, and `this.minY`). By default, the `pointerEvent` (last mouse or touch event related to the Draggable) will be passed as the only parameter to the callback so that you can, for example, access `pageX`, `pageY`, `target`, `currentTarget`, etc.
   * @see callbackScope
   */
  onDragStart?: (this: Draggable, event: PointerEvent) => void | null
  /**
   * An optional array of parameters to feed the `onDragStart` callback. For example, `onDragStartParams: ["drag started", 5]` would work with this code: `onDragStart: function(message, num) { console.log("message: " + message + ", num: " + num); }`.
   * @see onDragStart
   * @example ["drag started", 5]
   */
  onDragStartParams?: any[]
  /**
   * A function that should be called as soon as the mouse (or touch) is **released** after the drag. Even if nothing is moved, the `onDragEnd` will always fire, whereas the `onClick` callback only fires if the mouse/touch moves is less than 3 pixels. Inside that function, `this` refers to the Draggable instance (unless you specifically set the scope using `callbackScope`), making it easy to access the target element (`this.target`) or the boundary coordinates (`this.maxX`, `this.minX`, `this.maxY`, and `this.minY`). By default, the `pointerEvent` (last mouse or touch event related to the Draggable) will be passed as the only parameter to the callback so that you can, for example, access `pageX`, `pageY`, `target`, `currentTarget`, etc.
   * @see callbackScope
   * @see onClick
   */
  onDragEnd?: (this: Draggable, event: PointerEvent) => void | null
  /**
   * An optional array of parameters to feed the `onDragEnd` callback. For example, `onDragEndParams: ["drag ended", 5]` would work with this code: `onDragEnd: function(message, num) { console.log("message: " + message + ", num: " + num); }`.
   * @see onDragEnd
   * @example ["drag ended", 5]
   */
  onDragEndParams?: any[]
  /**
   * A function that should be called as soon as movement is locked into the horizontal or vertical axis. This happens when `lockAxis` is `true` and the user drags enough for Draggable to determine which axis to lock. It also happens on touch-enabled devices when you have a Draggable whose type only permits it to drag along one axis (like `type: "x"`, `type: "y"`, `type: "left"`, or `type: "top"`) and the user touch-drags and Draggable determines the direction, either allowing native touch-scrolling or Draggable-induced dragging. Inside the function, `this` refers to the Draggable instance, making it easy to access the locked axis (`this.lockedAxis` which will either be `"x"` or `"y"`), or the target element (`this.target`), etc. By default, the `pointerEvent` (last mouse or touch event related to the Draggable) will be passed as the only parameter to the callback so that you can, for example, access `pageX`, `pageY`, `target`, `currentTarget`, etc.
   * @see lockAxis
   */
  onLockAxis?: (this: Draggable, event: Event) => void | null
  /**
   * A function that should be called every time the mouse (or touch) moves regardless of whether or not the user is currently pressing/touching the element. Inside that function, `this` refers to the Draggable instance (unless you specifically set the scope using `callbackScope`), making it easy to access the target element (`this.target`) or the current position (`this.x` and `this.y`). By default, the `pointerEvent` (last mouse or touch event related to the Draggable) will be passed as the only parameter to the callback so that you can, for example, access `pageX`, `pageY`, `target`, `currentTarget`, etc.
   * @see callbackScope
   */
  onMove?: (this: Draggable, event: PointerEvent) => void | null
  /**
   * An optional array of parameters to feed the `onMove` callback. For example, `onMoveParams: ["moved", 5]` would work with this code: `onMove: function(message, num) { console.log("message: " + message + ", num: " + num); }`.
   * @see onMove
   * @example ["moved", 5]
   */
  onMoveParams?: any[]
  /**
   * A function that should be called as soon as the mouse (or touch) is pressed on the element. Inside that function, `this` refers to the Draggable instance (unless you specifically set the scope using `callbackScope`), making it easy to access the target element (`this.target`). By default, the `pointerEvent` (last mouse or touch event related to the Draggable) will be passed as the only parameter to the callback so that you can, for example, access `pageX`, `pageY`, `target`, `currentTarget`, etc.
   * @see callbackScope
   */
  onPress?: (this: Draggable, event: PointerEvent) => void | null
  /**
   * An optional array of parameters to feed the `onPress` callback. For example, `onPressParams: ["pressed", 5]` would work with this code: `onPress: function(message, num) { console.log("message: " + message + ", num: " + num); }`.
   * @see onPress
   * @example ["pressed", 5]
   */
  onPressParams?: any[]
  /**
   * A function that should be called as soon as the mouse (or touch) is pressed on the element for the FIRST time ONLY. This is great for setting up dynamic targets/handles and things that only need to happen once. Inside that function, `this` refers to the Draggable instance (unless you specifically set the scope using `callbackScope`), making it easy to access the target element (`this.target`). By default, the `pointerEvent` (last mouse or touch event related to the Draggable) will be passed as the only parameter to the callback so that you can, for example, access `pageX`, `pageY`, `target`, `currentTarget`, etc.
   * @see callbackScope
   */
  onPressInit?: (this: Draggable, event: PointerEvent) => void | null
  /**
   * An optional array of parameters to feed the `onPressInit` callback. For example, `onPressInitParams: ["init", 5]` would work with this code: `onPressInit: function(message, num) { console.log("message: " + message + ", num: " + num); }`.
   * @see onPressInit
   * @example ["init", 5]
   */
  onPressInitParams?: any[]
  /**
   * A function that should be called as soon as the mouse (or touch) is released regardless of whether or not the mouse/touch moved at all. Inside that function, `this` refers to the Draggable instance (unless you specifically set the scope using `callbackScope`), making it easy to access the target element (`this.target`). By default, the `pointerEvent` (last mouse or touch event related to the Draggable) will be passed as the only parameter to the callback so that you can, for example, access `pageX`, `pageY`, `target`, `currentTarget`, etc.
   * @see callbackScope
   */
  onRelease?: (this: Draggable, event: PointerEvent) => void | null
  /**
   * An optional array of parameters to feed the `onRelease` callback. For example, `onReleaseParams: ["released", 5]` would work with this code: `onRelease: function(message, num) { console.log("message: " + message + ", num: " + num); }`.
   * @see onRelease
   * @example ["released", 5]
   */
  onReleaseParams?: any[]
  /**
   * A function that should be called when the momentum-based movement (only if `inertia` is enabled) is complete. Inside that function, `this` refers to the Draggable instance (unless you specifically set the scope using `callbackScope`), making it easy to access the target element (`this.target`). By default, the InertiaPlugin's tween instance will be passed as the only parameter to the callback.
   * @see callbackScope
   * @see inertia
   */
  onThrowComplete?: (this: Draggable, event: PointerEvent) => void | null
  /**
   * An optional array of parameters to feed the `onThrowComplete` callback. For example, `onThrowCompleteParams: ["throw complete", 5]` would work with this code: `onThrowComplete: function(message, num) { console.log("message: " + message + ", num: " + num); }`.
   * @see onThrowComplete
   * @example ["throw complete", 5]
   */
  onThrowCompleteParams?: any[]
  /**
   * A function that should be called during the momentum-based movement (only if `inertia` is enabled). Inside that function, `this` refers to the Draggable instance (unless you specifically set the scope using `callbackScope`), making it easy to access the target element (`this.target`). By default, the InertiaPlugin's tween instance will be passed as the only parameter to the callback.
   * @see callbackScope
   * @see inertia
   */
  onThrowUpdate?: (this: Draggable, event: PointerEvent) => void | null
  /**
   * An optional array of parameters to feed the `onThrowUpdate` callback. For example, `onThrowUpdateParams: ["throw update", 5]` would work with this code: `onThrowUpdate: function(message, num) { console.log("message: " + message + ", num: " + num); }`.
   * @see onThrowUpdate
   * @example ["throw update", 5]
   */
  onThrowUpdateParams?: any[]
  /**
   * If `inertia` is true and you have `snap` defined (or `liveSnap`), this controls the maximum distance the element can travel beyond its snap point(s) during momentum-based movement after the mouse/touch is released. For example, `overshootTolerance: 5` would allow the element to overshoot snap points by a maximum of 5 pixels. The momentum movement will smoothly decelerate and return to the snap point.
   * @default 0
   * @see inertia
   * @see snap
   * @see liveSnap
   */
  overshootTolerance?: number
  /**
   * For InertiaPlugin only: A value between 0 and 1000 that controls how much resistance is applied to the momentum-based movement when `inertia` is enabled. If `resistance` is 500, it means that the velocity will be cut in half every 500ms (or every half second). Higher numbers make the element decelerate more slowly. A value of 0 would mean no resistance at all, and values over 1000 would effectively stop momentum immediately.
   * @default 50
   * @see inertia
   */
  resistance?: number
  /**
   * Allows you to define rules that the end position of the draggable element must adhere to. For example, you could implement a grid-based snapping or make the rotation snap to 45-degree increments or make the element always snap back to its starting position. You can define the `snap` in various ways like numbers, arrays, functions, or objects with multiple property rules.
   * @example 10 // snaps to the closest 10-pixel increment
   * @example [0, 10, 20, 30] // snaps to one of these values
   * @example function(endValue) { return Math.round(endValue / 10) * 10; } // custom snap function
   */
  snap?: Draggable.SnapValue | Draggable.SnapObject

  /**
   * This is a legacy property that has been replaced by `inertia`. It functions identically to `inertia` - setting it to `true` enables momentum-based movement when the user releases their mouse/touch after dragging. You can also pass an object with InertiaPlugin configuration options.
   * @deprecated Use `inertia` instead
   * @see inertia
   */
  throwProps?: boolean | gsap.InertiaVars
  /**
   * This is a legacy property that has been replaced by `resistance`. It controls the deceleration of momentum-based movement when `throwProps` (or `inertia`) is enabled. A higher number makes the element decelerate more slowly.
   * @deprecated Use `resistance` instead
   * @see resistance
   * @see throwProps
   */
  throwResistance?: number
  /**
   * You can define a different DOM element (or selector text like `"#handle"`) to be the "trigger" for starting/stopping the drag action. For example, if you want the entire element to be draggable, but you only want them to be able to start the drag when they click on a particular child element (like a "handle"), you would set the `trigger` to that child element.
   * @example "#handle"
   * @example document.getElementById("handle")
   */
  trigger?: gsap.DOMTarget
  /**
   * Defines what type of dragging is allowed. The default is `"x,y"` which allows the element to be dragged along both the x- and y-axis. You can also restrict it to only one axis. The other options are `"x"`, `"y"`, `"top"`, `"left"`, `"rotation"`, `"scroll"`, or `"scrollTop"`. Note that if you use `"top"` and `"left"`, transforms won't be used at all (the top and left style properties will be changed instead).
   * @default "x,y"
   * @example "x" // only horizontal movement
   * @example "y" // only vertical movement
   * @example "rotation" // only rotation
   * @example "scroll" // for scrollable elements
   */
  type?: Draggable.DraggableType
  /**
   * When `true`, the z-index of the element will be boosted (by adding 1000 to it) during the drag, making sure it's on top. When the drag stops, the z-index reverts to what it was before the drag. This can be helpful if there are other elements that may cover up the draggable element during the drag. If you'd prefer a different z-index boost amount, you can use a number instead of `true` (or you can control this yourself inside your `onDragStart` and `onDragEnd` callbacks).
   * @default false
   * @example true // adds 1000 to z-index during drag
   * @example 2000 // adds 2000 to z-index during drag
   */
  zIndexBoost?: boolean

  // Vue-specific props
  /**
   * A Vue-specific prop that controls whether the draggable is enabled or disabled. When `true`, the draggable will be disabled and won't respond to user interactions. When `false`, the draggable will be enabled.
   * @default false
   */
  disabled?: boolean
}

defineOptions({
  inheritAttrs: false, // Prevents Vue from applying attributes to the root element
})

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

// Define all possible events based on Draggable.CallbackType
const emit = defineEmits<{
  click: [draggable: Draggable, event: Event]
  drag: [draggable: Draggable, event: Event]
  dragend: [draggable: Draggable, event: Event]
  dragstart: [draggable: Draggable, event: Event]
  move: [draggable: Draggable, event: Event]
  press: [draggable: Draggable, event: Event]
  release: [draggable: Draggable, event: Event]
  throwcomplete: [draggable: Draggable, event: Event]
  throwupdate: [draggable: Draggable, event: Event]
}>()

defineSlots<{
  default: (scope: { draggable?: Draggable }) => any
  trigger: (scope: { draggable?: Draggable }) => any
  bounds: (scope: { draggable?: Draggable }) => any
}>()

const containerRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()
const boundsRef = ref<HTMLElement>()
const draggableInstance = ref<Draggable>()

// Reactive refs that get updated through draggable callbacks
const autoScroll = ref(0)
const deltaX = ref(0)
const deltaY = ref(0)
const endRotation = ref(0)
const endX = ref(0)
const endY = ref(0)
const isDragging = ref(false)
const isPressed = ref(false)
const isThrowing = ref(false)
const lockAxis = ref(false)
const maxRotation = ref(0)
const maxX = ref(0)
const maxY = ref(0)
const minX = ref(0)
const minY = ref(0)
const minRotation = ref(0)
const pointerEvent = ref<TouchEvent | PointerEvent>()
const pointerX = ref(0)
const pointerY = ref(0)
const rotation = ref(0)
const scrollProxy = ref<any>()
const startX = ref(0)
const startY = ref(0)
const target = ref<HTMLElement | SVGElement>()
const tween = ref<gsap.core.Tween>()
const vars = ref<Draggable.Vars>()
const x = ref(0)
const y = ref(0)

// Function to update reactive properties from draggable instance
function updateReactiveProperties() {
  if (!draggableInstance.value) {
    return
  }

  const instance = draggableInstance.value
  autoScroll.value = instance.autoScroll
  deltaX.value = instance.deltaX
  deltaY.value = instance.deltaY
  endRotation.value = instance.endRotation
  endX.value = instance.endX
  endY.value = instance.endY
  isDragging.value = instance.isDragging
  isPressed.value = instance.isPressed
  isThrowing.value = instance.isThrowing
  lockAxis.value = instance.lockAxis
  maxRotation.value = instance.maxRotation
  maxX.value = instance.maxX
  maxY.value = instance.maxY
  minX.value = instance.minX
  minY.value = instance.minY
  minRotation.value = instance.minRotation
  pointerEvent.value = instance.pointerEvent
  pointerX.value = instance.pointerX
  pointerY.value = instance.pointerY
  rotation.value = instance.rotation
  scrollProxy.value = instance.scrollProxy
  startX.value = instance.startX
  startY.value = instance.startY
  target.value = instance.target
  tween.value = instance.tween
  vars.value = instance.vars
  x.value = instance.x
  y.value = instance.y
}

// Methods that proxy to the Draggable instance
function addEventListener(type: Draggable.CallbackType, callback: (this: Draggable, event: PointerEvent) => void | null) {
  draggableInstance.value?.addEventListener(type, callback)
}

function applyBounds(bounds: gsap.DOMTarget | Draggable.BoundsMinMax | Draggable.BoundsRectangle | Draggable.BoundsRotation) {
  draggableInstance.value?.applyBounds(bounds)
}

function disable(type?: string | object) {
  return draggableInstance.value?.disable(type)
}

function dispatchEvent(type: Draggable.CallbackType) {
  return draggableInstance.value?.dispatchEvent(type) ?? false
}

function enable(type?: string | object) {
  return draggableInstance.value?.enable(type)
}

function enabled(value?: boolean) {
  if (value !== undefined) {
    return draggableInstance.value?.enabled(value)
  }
  return draggableInstance.value?.enabled() ?? false
}

function endDrag(event: Event) {
  draggableInstance.value?.endDrag(event)
}

function getDirection(from: 'start' | 'velocity' | gsap.DOMTarget) {
  return draggableInstance.value?.getDirection(from)
}

function hitTest(testObject: Draggable.TestObject, threshold?: number | string) {
  return draggableInstance.value?.hitTest(testObject, threshold) ?? false
}

function kill() {
  return draggableInstance.value?.kill()
}

function removeEventListener(type: Draggable.CallbackType, callback: (this: Draggable, event: PointerEvent) => void | null) {
  draggableInstance.value?.removeEventListener(type, callback)
}

function startDrag(event: Partial<PointerEvent> | Partial<TouchEvent>, align?: boolean) {
  draggableInstance.value?.startDrag(event, align)
}

function timeSinceDrag() {
  return draggableInstance.value?.timeSinceDrag() ?? 0
}

function update(applyBounds?: boolean, sticky?: boolean) {
  const result = draggableInstance.value?.update(applyBounds, sticky)
  updateReactiveProperties()
  return result
}

// Create the draggable configuration from props
function createDraggableConfig(): Props {
  const config: Props = { ...props }

  // Remove Vue-specific props
  delete config.disabled

  // Set up event callbacks to emit Vue events and update reactive properties
  config.onClick = function (this: Draggable, event: PointerEvent | TouchEvent) {
    updateReactiveProperties()
    emit('click', this, event)
  }

  config.onDrag = function (this: Draggable, event: PointerEvent | TouchEvent) {
    updateReactiveProperties()
    emit('drag', this, event)
  }

  config.onDragEnd = function (this: Draggable, event: PointerEvent | TouchEvent) {
    updateReactiveProperties()
    emit('dragend', this, event)
  }

  config.onDragStart = function (this: Draggable, event: PointerEvent | TouchEvent) {
    updateReactiveProperties()
    emit('dragstart', this, event)
  }

  config.onMove = function (this: Draggable, event: PointerEvent | TouchEvent) {
    updateReactiveProperties()
    emit('move', this, event)
  }

  config.onPress = function (this: Draggable, event: PointerEvent | TouchEvent) {
    updateReactiveProperties()
    emit('press', this, event)
  }

  config.onRelease = function (this: Draggable, event: PointerEvent | TouchEvent) {
    updateReactiveProperties()
    emit('release', this, event)
  }

  config.onThrowComplete = function (this: Draggable, event: PointerEvent | TouchEvent) {
    updateReactiveProperties()
    emit('throwcomplete', this, event)
  }

  config.onThrowUpdate = function (this: Draggable, event: PointerEvent | TouchEvent) {
    updateReactiveProperties()
    emit('throwupdate', this, event)
  }

  // Handle bounds slot if provided
  if (boundsRef.value) {
    // Find the bounds element from the rendered bounds slot
    config.bounds = boundsRef.value as HTMLElement
  }
  if (triggerRef.value) {
    // If a trigger is defined, use it
    config.trigger = triggerRef.value as gsap.DOMTarget
  }

  return config
}

// Initialize draggable
function initDraggable() {
  if (!containerRef.value) {
    return
  }

  const config = createDraggableConfig()
  const [instance] = Draggable.create(containerRef.value, config)
  draggableInstance.value = instance

  // Handle disabled state
  if (props.disabled) {
    instance.disable()
  }

  // Update reactive properties immediately
  updateReactiveProperties()
}

// Clean up draggable
function destroyDraggable() {
  if (draggableInstance.value) {
    draggableInstance.value.kill()
    draggableInstance.value = undefined
  }
}

// Watch for disabled prop changes
watch(() => props.disabled, (disabled) => {
  if (draggableInstance.value) {
    if (disabled) {
      draggableInstance.value.disable()
    }
    else {
      draggableInstance.value.enable()
    }
  }
})

watch(boundsRef, (newBounds) => {
  if (draggableInstance.value && newBounds) {
    draggableInstance.value.applyBounds(newBounds as gsap.DOMTarget)
  }
})

// Watch for other prop changes and recreate draggable
watch(() => props, () => {
  destroyDraggable()
  nextTick(() => {
    initDraggable()
  })
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    initDraggable()
  })
})

onUnmounted(() => {
  destroyDraggable()
})

// Expose all properties and methods to parent
defineExpose({
  // Properties
  autoScroll,
  containerRef,
  deltaX,
  deltaY,
  endRotation,
  endX,
  endY,
  isDragging,
  isPressed,
  isThrowing,
  lockAxis,
  maxRotation,
  maxX,
  maxY,
  minX,
  minY,
  minRotation,
  pointerEvent,
  pointerX,
  pointerY,
  rotation,
  scrollProxy,
  startX,
  startY,
  target,
  tween,
  vars,
  x,
  y,

  // Methods
  addEventListener,
  applyBounds,
  disable,
  dispatchEvent,
  enable,
  enabled,
  endDrag,
  getDirection,
  hitTest,
  kill,
  removeEventListener,
  //   tweenTo,
  startDrag,
  timeSinceDrag,
  update,

  // Direct access to instance
  instance: draggableInstance,
})
</script>

<template>
  <div
    v-if="$slots.bounds"
    ref="boundsRef"
  >
    <slot
      name="bounds"
      :draggable="draggableInstance"
    />
  </div>
  <div
    ref="containerRef"
    :class="$attrs.class"
    :style="$attrs.style"
  >
    <slot
      name="default"
      :draggable="draggableInstance"
    >
      <div
        v-if="$slots.trigger"
        ref="triggerRef"
      >
        <slot
          name="trigger"
          :draggable="draggableInstance"
        />
      </div>
    </slot>
  </div>
</template>

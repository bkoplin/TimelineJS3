<template>
  <div ref="timelineContainer" class="vue-timeline tl-container" tabindex="0" role="region" :aria-label="i18n.aria_label_timeline">
    <div v-if="loaded" class="tl-storyslider" ref="storyslider"></div>
    <div v-if="loaded" class="tl-timenav" ref="timenav"></div>
    <div v-if="loaded" class="tl-menubar" ref="menubar"></div>
    <div class="tl-attribution">
      <a href="https://timeline.knightlab.com" target="_blank" rel="noopener">
        <span class="tl-knightlab-logo"></span>TimelineJS
      </a>
    </div>
    <div v-if="!loaded" class="tl-message-full">{{ message }}</div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick } from 'vue'
import { TimeNav } from '../core/timenav/TimeNav'
import { StorySlider } from '../core/slider/StorySlider'
import { MenuBar } from '../core/ui/MenuBar'
import { TimelineConfig } from '../core/TimelineConfig'
import { hexToRgb, mergeData } from '../core/Util'
import { easeInOutQuint, easeOutStrong } from '../core/animation/Ease'
import { Animate } from '../core/animation/Animate'
import * as Browser from '../core/Browser'
import * as DOM from '../core/dom/DOM'
import Message from '../core/ui/Message'
import { english } from '../core/language/Language'

export default {
  name: 'Timeline',
  props: {
    data: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  emits: [
    'ready',
    'loaded',
    'changed',
    'colorchange',
    'nav_next',
    'nav_previous',
    'zoom_in',
    'zoom_out',
    'back_to_start',
    'forward_to_end'
  ],
  setup(props, { emit }) {
    const timelineContainer = ref(null)
    const storyslider = ref(null)
    const timenav = ref(null)
    const menubar = ref(null)
    
    const loaded = ref(false)
    const message = ref('Loading timeline...')
    const config = ref(null)
    const currentId = ref(null)
    const ready = ref(false)
    
    // Internal components
    let _storyslider = null
    let _timenav = null
    let _menubar = null
    let _loaded = { storyslider: false, timenav: false }
    
    // Animation objects
    let animator_timenav = null
    let animator_storyslider = null
    let animator_menubar = null
    
    // Language
    const i18n = ref(english)
    
    // Default configuration options
    const defaultOptions = {
      height: null,
      width: null,
      debug: false,
      font: 'default',
      is_embed: false,
      is_full_embed: false,
      hash_bookmark: false,
      default_bg_color: { r: 255, g: 255, b: 255 },
      scale_factor: 2, // How many screen widths wide should the timeline be
      layout: "landscape", // portrait or landscape
      timenav_position: "bottom", // timeline on top or bottom
      optimal_tick_width: 60, // optimal distance (in pixels) between ticks on axis
      base_class: "tl-timeline", // removing tl-timeline will break all default stylesheets...
      timenav_height: null,
      timenav_height_percentage: 25, // Overrides timenav height as a percentage of the screen
      timenav_mobile_height_percentage: 40, // timenav height as a percentage on mobile devices
      timenav_height_min: 175, // Minimum timenav height
      marker_height_min: 30, // Minimum Marker Height
      marker_width_min: 100, // Minimum Marker Width
      marker_padding: 5, // Top Bottom Marker Padding
      start_at_slide: 0,
      start_at_end: false,
      menubar_height: 0,
      skinny_size: 650,
      medium_size: 800,
      use_bc: false, // Use declared suffix on dates earlier than 0
      // animation
      duration: 1000,
      ease: easeInOutQuint,
      // interaction
      dragging: true,
      trackResize: true,
      map_type: "stamen:toner-lite",
      slide_padding_lr: 100, // padding on slide of slide
      slide_default_fade: "0%", // landscape fade
      zoom_sequence: [0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89], // Array of Fibonacci numbers for TimeNav zoom levels
      track_events: ['back_to_start', 'nav_next', 'nav_previous', 'zoom_in', 'zoom_out'],
      theme: null
    }
    
    const options = ref(mergeData({}, defaultOptions))
    
    watch(() => props.options, (newOptions) => {
      if (newOptions) {
        processOptions(newOptions)
      }
    }, { deep: true, immediate: true })
    
    watch(() => props.data, (newData) => {
      if (newData) {
        initData(newData)
      }
    }, { deep: true, immediate: true })
    
    function processOptions(newOptions) {
      // Process background color
      if (typeof newOptions.default_bg_color === 'string') {
        const parsed = hexToRgb(newOptions.default_bg_color)
        if (parsed) {
          newOptions.default_bg_color = parsed
        } else {
          delete newOptions.default_bg_color
          console.warn('Invalid default background color. Ignoring.')
        }
      }
      
      // Merge options
      mergeData(options.value, newOptions)
      
      if (ready.value) {
        updateDisplay()
      }
    }
    
    function initData(data) {
      if (data) {
        try {
          config.value = new TimelineConfig(data)
          if (config.value.isValid()) {
            config.value.validate()
            if (config.value.isValid()) {
              onDataLoaded()
            } else {
              const errs = config.value.getErrors()
              message.value = `Error: ${errs.join(', ')}`
            }
          } else {
            message.value = 'Invalid timeline configuration'
          }
        } catch (e) {
          message.value = `Error initializing timeline: ${e.message}`
        }
      }
    }
    
    function onDataLoaded() {
      emit('dataloaded')
      nextTick(() => {
        initLayout()
        initEvents()
        
        // Hide message
        message.value = ''
        loaded.value = true
        
        ready.value = true
        emit('ready')
      })
    }
    
    function initLayout() {
      // Create Layout
      if (options.value.timenav_position === "top") {
        _timenav = new TimeNav(timenav.value, config.value, options.value, i18n.value)
        _menubar = new MenuBar(menubar.value, timelineContainer.value, options.value, i18n.value)
        _storyslider = new StorySlider(storyslider.value, config.value, options.value, i18n.value)
      } else {
        _storyslider = new StorySlider(storyslider.value, config.value, options.value, i18n.value)
        _timenav = new TimeNav(timenav.value, config.value, options.value, i18n.value)
        _menubar = new MenuBar(menubar.value, timelineContainer.value, options.value, i18n.value)
      }

      // Set attributes
      storyslider.value.setAttribute('role', 'group')
      storyslider.value.setAttribute('aria-label', i18n.value.aria_label_timeline_content)
      
      // Set up event handlers
      _timenav.on('loaded', onTimeNavLoaded)
      _storyslider.on('loaded', onStorySliderLoaded)
      
      // Initial Default Layout
      options.value.width = timelineContainer.value.offsetWidth
      options.value.height = timelineContainer.value.offsetHeight
      
      // Set TimeNav Height
      options.value.timenav_height = calculateTimeNavHeight(options.value.timenav_height)

      // Init components
      _timenav.init()
      _storyslider.init()
      
      // Apply initial zoom if specified
      if (options.value.initial_zoom) {
        setZoom(options.value.initial_zoom)
      }
      
      // Update display
      updateDisplay()
    }
    
    function initEvents() {
      // TimeNav Events
      _timenav.on('change', onTimeNavChange)
      _timenav.on('zoomtoggle', onZoomToggle)
      _timenav.on('visible_ticks_change', onVisibleTicksChange)

      // StorySlider Events
      _storyslider.on('change', onSlideChange)
      _storyslider.on('colorchange', onColorChange)
      _storyslider.on('nav_next', onStorySliderNext)
      _storyslider.on('nav_previous', onStorySliderPrevious)

      // Menubar Events
      _menubar.on('zoom_in', onZoomIn)
      _menubar.on('zoom_out', onZoomOut)
      _menubar.on('forward_to_end', onForwardToEnd)
      _menubar.on('back_to_start', onBackToStart)

      // Keyboard events
      document.addEventListener('keydown', onKeydown)
      
      // Window resize
      if (options.value.trackResize) {
        window.addEventListener('resize', () => {
          updateDisplay()
        })
      }
    }
    
    function onKeydown(event) {
      if (config.value) {
        const keyName = event.key
        const currentSlide = getSlideIndex(currentId.value)
        const _n = config.value.events.length - 1
        const lastSlide = config.value.title ? _n + 1 : _n
        const firstSlide = 0

        if (keyName === 'ArrowLeft') {
          if (currentSlide !== firstSlide) {
            goToPrev()
          }
        } else if (keyName === 'ArrowRight') {
          if (currentSlide !== lastSlide) {
            goToNext()
          }
        }
      }
    }
    
    function onColorChange(e) {
      emit('colorchange', { unique_id: currentId.value })
    }

    function onSlideChange(e) {
      if (currentId.value !== e.unique_id) {
        currentId.value = e.unique_id
        _timenav.goToId(currentId.value)
        onChange(e)
      }
    }

    function onTimeNavChange(e) {
      if (currentId.value !== e.unique_id) {
        currentId.value = e.unique_id
        _storyslider.goToId(currentId.value)
        onChange(e)
      }
    }

    function onChange(e) {
      emit('changed', { unique_id: currentId.value })
      if (options.value.hash_bookmark && currentId.value) {
        updateHashBookmark(currentId.value)
      }
    }

    function onZoomToggle(e) {
      if (e.zoom === "in") {
        _menubar.toogleZoomIn(e.show)
      } else if (e.zoom === "out") {
        _menubar.toogleZoomOut(e.show)
      }
    }

    function onVisibleTicksChange(e) {
      _menubar.changeVisibleTicks(e.visible_ticks)
    }

    function onForwardToEnd(e) {
      goToEnd()
      emit('forward_to_end', { unique_id: currentId.value })
    }

    function onBackToStart(e) {
      goToStart()
      emit('back_to_start', { unique_id: currentId.value })
    }

    function onZoomIn(e) {
      _timenav.zoomIn()
      emit('zoom_in', { zoom_level: _timenav.options.scale_factor })
    }

    function onZoomOut(e) {
      _timenav.zoomOut()
      emit('zoom_out', { zoom_level: _timenav.options.scale_factor })
    }
    
    function onTimeNavLoaded() {
      _loaded.timenav = true
      checkLoaded()
    }

    function onStorySliderLoaded() {
      _loaded.storyslider = true
      checkLoaded()
    }

    function onStorySliderNext(e) {
      emit('nav_next', e)
    }

    function onStorySliderPrevious(e) {
      emit('nav_previous', e)
    }
    
    function checkLoaded() {
      if (_loaded.storyslider && _loaded.timenav) {
        emit('loaded', config.value)
        // Go to proper slide
        if (Boolean(options.value.start_at_end) || 
            options.value.start_at_slide > config.value.events.length) {
          goToEnd()
        } else {
          goTo(options.value.start_at_slide)
        }
        if (options.value.hash_bookmark) {
          if (window.location.hash !== "") {
            goToId(window.location.hash.replace("#event-", ""))
          } else {
            updateHashBookmark(currentId.value)
          }
          window.addEventListener('hashchange', () => {
            if (window.location.hash.indexOf('#event-') === 0) {
              goToId(window.location.hash.replace("#event-", ""))
            }
          }, false)
        }
      }
    }
    
    function updateDisplay(animate, d) {
      const duration = d || options.value.duration
      
      // Update width and height
      options.value.width = timelineContainer.value.offsetWidth
      options.value.height = timelineContainer.value.offsetHeight

      // Check if skinny
      let display_class = options.value.base_class
      if (options.value.width <= options.value.skinny_size) {
        display_class += " tl-skinny"
        options.value.layout = "portrait"
      } else if (options.value.width <= options.value.medium_size) {
        display_class += " tl-medium"
        options.value.layout = "landscape"
      } else {
        options.value.layout = "landscape"
      }

      // Detect Mobile and Update Orientation
      if (Browser.touch) {
        options.value.layout = Browser.orientation()
      }

      if (Browser.mobile) {
        display_class += " tl-mobile"
        // Set TimeNav Height
        options.value.timenav_height = calculateTimeNavHeight(
          options.value.timenav_height, 
          options.value.timenav_mobile_height_percentage
        )
      } else {
        // Set TimeNav Height
        options.value.timenav_height = calculateTimeNavHeight(options.value.timenav_height)
      }

      // LAYOUT
      if (options.value.layout === "portrait") {
        // Portrait
        display_class += " tl-layout-portrait"
      } else {
        // Landscape
        display_class += " tl-layout-landscape"
      }

      // Set StorySlider Height
      options.value.storyslider_height = (options.value.height - options.value.timenav_height)

      // Position Menu
      let menu_position = 0
      if (options.value.timenav_position === "top") {
        menu_position = (Math.ceil(options.value.timenav_height) / 2) - 
                        (menubar.value.offsetHeight / 2) - (39 / 2)
      } else {
        menu_position = Math.round(options.value.storyslider_height + 1 + 
                        (Math.ceil(options.value.timenav_height) / 2) - 
                        (menubar.value.offsetHeight / 2) - (35 / 2))
      }

      if (animate) {
        timenav.value.style.height = Math.ceil(options.value.timenav_height) + "px"

        // Animate StorySlider
        if (animator_storyslider) {
          animator_storyslider.stop()
        }
        animator_storyslider = Animate(storyslider.value, {
          height: options.value.storyslider_height + "px",
          duration: duration / 2,
          easing: easeOutStrong
        })

        // Animate Menubar
        if (animator_menubar) {
          animator_menubar.stop()
        }
        animator_menubar = Animate(menubar.value, {
          top: menu_position + "px",
          duration: duration / 2,
          easing: easeOutStrong
        })
      } else {
        // TimeNav
        timenav.value.style.height = Math.ceil(options.value.timenav_height) + "px"

        // StorySlider
        storyslider.value.style.height = options.value.storyslider_height + "px"

        // Menubar
        menubar.value.style.top = menu_position + "px"
      }

      // Update Component Displays
      _timenav.updateDisplay(options.value.width, options.value.timenav_height, animate)
      _storyslider.updateDisplay(
        options.value.width, 
        options.value.storyslider_height, 
        animate, 
        options.value.layout
      )

      if (i18n.value.direction === 'rtl') {
        display_class += ' tl-rtl'
      }

      // Apply class
      timelineContainer.value.className = display_class
    }
    
    function calculateTimeNavHeight(timenav_height, timenav_height_percentage) {
      let height = 0

      if (timenav_height) {
        height = timenav_height
      } else {
        if (options.value.timenav_height_percentage || timenav_height_percentage) {
          if (timenav_height_percentage) {
            height = Math.round((options.value.height / 100) * timenav_height_percentage)
          } else {
            height = Math.round((options.value.height / 100) * options.value.timenav_height_percentage)
          }
        }
      }

      // Set new minimum based on how many rows needed
      if (_timenav && _timenav.ready) {
        if (options.value.timenav_height_min < _timenav.getMinimumHeight()) {
          options.value.timenav_height_min = _timenav.getMinimumHeight()
        }
      }

      // If height is less than minimum set it to minimum
      if (height < options.value.timenav_height_min) {
        height = options.value.timenav_height_min
      }

      height = height - (options.value.marker_padding * 2)

      return height
    }
    
    function getSlideIndex(id) {
      if (config.value) {
        if (config.value.title && config.value.title.unique_id === id) {
          return 0
        }
        for (let i = 0; i < config.value.events.length; i++) {
          if (id === config.value.events[i].unique_id) {
            return config.value.title ? i + 1 : i
          }
        }
      }
      return -1
    }
    
    function getEventIndex(id) {
      if (config.value) {
        for (let i = 0; i < config.value.events.length; i++) {
          if (id === config.value.events[i].unique_id) {
            return i
          }
        }
      }
      return -1
    }
    
    function updateHashBookmark(id) {
      if (id) {
        const hash = "#event-" + id.toString()
        window.history.replaceState(null, "Browsing TimelineJS", hash)
      }
    }
    
    // Public API methods
    function goToId(id) {
      if (currentId.value !== id) {
        currentId.value = id
        _timenav.goToId(currentId.value)
        _storyslider.goToId(currentId.value, false, true)
        emit('changed', { unique_id: currentId.value })
      }
    }
    
    function goTo(n) {
      if (n < 0) {
        return
      }

      try {
        if (config.value.title) {
          if (n === 0) {
            goToId(config.value.title.unique_id)
          } else {
            goToId(config.value.events[n - 1].unique_id)
          }
        } else {
          goToId(config.value.events[n].unique_id)
        }
      } catch {
        return
      }
    }
    
    function goToStart() {
      goTo(0)
    }
    
    function goToEnd() {
      const _n = config.value.events.length - 1
      goTo(config.value.title ? _n + 1 : _n)
    }
    
    function goToPrev() {
      goTo(getSlideIndex(currentId.value) - 1)
      focusContainer()
    }
    
    function goToNext() {
      goTo(getSlideIndex(currentId.value) + 1)
      focusContainer()
    }
    
    function focusContainer() {
      timelineContainer.value.focus()
    }
    
    function zoomIn() {
      _timenav.zoomIn()
    }
    
    function zoomOut() {
      _timenav.zoomOut()
    }
    
    function setZoom(level) {
      _timenav.setZoom(level)
    }
    
    onMounted(() => {
      if (props.data) {
        initData(props.data)
      }
    })
    
    return {
      timelineContainer,
      storyslider,
      timenav,
      menubar,
      loaded,
      message,
      i18n,
      goToId,
      goTo,
      goToStart,
      goToEnd,
      goToPrev,
      goToNext,
      zoomIn,
      zoomOut,
      setZoom,
      updateDisplay
    }
  }
}
</script>

<style>
.tl-timeline {
  width: 100%;
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.3;
  position: relative;
  background-color: rgb(var(--timeline-bg, 255 255 255));
  color: rgb(var(--timeline-text, 51 51 51));
  overflow: hidden;
}

.tl-storyslider {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.tl-timenav {
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: rgb(var(--timeline-line, 204 204 204));
}

.tl-menubar {
  position: absolute;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tl-attribution {
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 10px;
  color: #999;
  z-index: 10;
}

.tl-message-full {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 10px;
}

.tl-rtl {
  direction: rtl;
}

.tl-layout-portrait .tl-storyslider {
  height: 45%;
}

.tl-layout-portrait .tl-timenav {
  height: 55%;
}

.tl-skinny .tl-storyslider {
  height: 55%;
}

.tl-skinny .tl-timenav {
  height: 45%;
}

.tl-medium .tl-storyslider {
  height: 60%;
}

.tl-medium .tl-timenav {
  height: 40%;
}

.tl-mobile .tl-storyslider {
  height: 55%;
}

.tl-mobile .tl-timenav {
  height: 45%;
}

.tl-knightlab-logo {
  display: inline-block;
  vertical-align: middle;
  height: 12px;
  width: 12px;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNMTMuNTQgMi4xM0wxNCAxLjY3IDEzLjU0IDEuMjFDMTIuNTggLjI1IDExLjMzIDAgMTAgMGMtMS4zMyAwLTIuNTguMjUtMy41NCAxLjIxTDYgMS42N2wuNDYuNDZDNy40MiAzLjA4IDggMy44MyA4IDVWN2gyVjVjMC0xLjE3LjU4LTEuOTIgMS41NC0yLjg3eiIvPjxwYXRoIGQ9Ik04IDZINnY0YzAgMS4xNy0uNTggMS45Mi0xLjU0IDIuODdsLS40Ni40Ni40Ni40NkM1LjQyIDE0Ljc1IDYuNjcgMTUgOCAxNWMxLjMzIDAgMi41OC0uMjUgMy41NC0xLjIxbC40Ni0uNDYtLjQ2LS40NkMxMC41OCAxMS45MiAxMCAxMS4xNyAxMCAxMFY2SDh6Ii8+PC9zdmc+");
  background-repeat: no-repeat;
  background-position: center;
  margin-right: 3px;
  opacity: 0.5;
}

.tl-attribution a {
  color: #999;
  text-decoration: none;
}

.tl-attribution a:hover {
  color: #333;
  text-decoration: underline;
}
</style>

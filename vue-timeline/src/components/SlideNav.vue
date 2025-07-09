<script setup lang="ts">
import { computed } from 'vue'

// Define props
const props = defineProps<{
  direction: 'previous' | 'next'
  title?: string
  date?: string
  inverted?: boolean
  visible?: boolean
}>()

// Define emits
const emit = defineEmits<{
  (e: 'clicked', direction: 'previous' | 'next'): void
}>()

// Computed properties for styling and content
const buttonClasses = computed(() => ({
  'tl-slidenav-previous': props.direction === 'previous',
  'tl-slidenav-next': props.direction === 'next',
  'absolute top-[45%] z-10 cursor-pointer p-0 bg-transparent border-none text-inherit': true,
  'text-left left-0': props.direction === 'previous',
  'text-right right-0': props.direction === 'next',
}))

const containerClasses = computed(() => ({
  'tl-slidenav-content-container': true,
  'tl-slidenav-inverted': props.inverted,
  'w-25': true, // 100px width
}))

const iconClasses = computed(() => ({
  'tl-slidenav-icon': true,
  'text-32px mb-1.25 leading-none antialiased': true,
  'ml-0': props.direction === 'previous',
  'ml-19': props.direction === 'next', // margin-left: 76px (100 - 24)
}))

const titleClasses = computed(() => ({
  'tl-slidenav-title': true,
  'mt-2.5 text-12px leading-12px w-20 line-clamp-2 text-ellipsis opacity-15': true,
  'ml-5': props.direction === 'next',
}))

const descriptionClasses = computed(() => ({
  'tl-slidenav-description': true,
  'text-12px mt-1.25 w-20 line-clamp-2 text-ellipsis opacity-0': true,
  'ml-5': props.direction === 'next',
}))

const iconContent = computed(() => {
  return props.direction === 'next' ? '▶' : '◀'
})

const ariaLabel = computed(() => {
  const directionText = props.direction === 'next' ? 'Next' : 'Previous'
  const title = props.title || ''
  const date = props.date || ''
  return `${directionText}, ${title}, ${date}`.trim()
})

// Event handlers
function handleClick() {
  emit('clicked', props.direction)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handleClick()
  }
}
</script>

<template>
  <button
    v-if="visible !== false"
    :class="buttonClasses"
    :aria-label="ariaLabel"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <div :class="containerClasses">
      <!-- Icon -->
      <div
        :class="iconClasses"
        class="tl-slidenav-icon"
        v-html="iconContent"
      />
      
      <!-- Title -->
      <div :class="titleClasses">
        {{ title }}
      </div>
      
      <!-- Description (Date) -->
      <div :class="descriptionClasses">
        {{ date }}
      </div>
    </div>
  </button>
</template>

<style scoped>
/* SlideNav styles based on TL.SlideNav.less */

/* Base navigation styles */
.tl-slidenav-previous,
.tl-slidenav-next {
  outline-offset: 5px;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  text-transform: inherit;

  .tl-slidenav-content-container {
    .tl-slidenav-icon,
    .tl-slidenav-title,
    .tl-slidenav-description {
      text-shadow: 1px 1px 1px white;
      color: #333;
    }
  }

  .tl-slidenav-content-container.tl-slidenav-inverted {
    .tl-slidenav-icon,
    .tl-slidenav-title,
    .tl-slidenav-description {
      color: white;
      text-shadow: 1px 1px 1px #333;
    }
  }
}

/* Navigation positioning */
.tl-slidenav-next {
  margin-right: 10px;
}

.tl-slidenav-previous {
  margin-left: 10px;
}

/* Icon styling */
.tl-slidenav-icon {
  font-style: normal;
  font-weight: bold;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Title and description overflow handling */
.tl-slidenav-title,
.tl-slidenav-description {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  text-overflow: ellipsis;
}

/* Hover effects */
.tl-slidenav-previous:hover,
.tl-slidenav-previous:focus-visible,
.tl-slidenav-next:hover,
.tl-slidenav-next:focus-visible {
  .tl-slidenav-title {
    opacity: 1;
  }
  
  .tl-slidenav-description {
    opacity: 0.5;
  }
}

.tl-slidenav-next:hover .tl-slidenav-icon,
.tl-slidenav-next:focus-visible .tl-slidenav-icon {
  margin-left: 20px; /* 100 - 20px for next button */
}

.tl-slidenav-previous:hover .tl-slidenav-icon,
.tl-slidenav-previous:focus-visible .tl-slidenav-icon {
  margin-left: -4px;
}

/* RTL support */
[dir="rtl"] .tl-slidenav-previous {
  direction: ltr;
}

[dir="rtl"] .tl-slidenav-next:hover .tl-slidenav-icon {
  margin-right: -4px;
}

/* Mobile and skinny layout styles */
@media only screen and (max-width: 500px) {
  .tl-slidenav-previous,
  .tl-slidenav-next {
    display: none;
  }
}

/* Skinny layout - when container is narrow */
.tl-skinny .tl-slidenav-next .tl-slidenav-icon {
  margin-left: 8px; /* 32 - 24px */
}

.tl-skinny .tl-slidenav-previous,
.tl-skinny .tl-slidenav-next {
  .tl-slidenav-content-container {
    width: 32px;
    height: 32px;
  }
  
  .tl-slidenav-title,
  .tl-slidenav-description {
    display: none;
  }
  
  .tl-slidenav-icon {
    opacity: 0.33;
  }
}

.tl-skinny .tl-slidenav-next:hover .tl-slidenav-icon,
.tl-skinny .tl-slidenav-next:focus-visible .tl-slidenav-icon {
  margin-left: 12px; /* 32 - 20px */
  opacity: 1;
}

.tl-skinny .tl-slidenav-previous:hover .tl-slidenav-icon,
.tl-skinny .tl-slidenav-previous:focus-visible .tl-slidenav-icon {
  margin-left: -4px;
  opacity: 1;
}

/* Mobile layout specific styles */
.tl-layout-landscape.tl-mobile {
  .tl-slidenav-next:hover .tl-slidenav-icon {
    margin-left: 76px; /* 100 - 24px - reset on mobile */
    opacity: 1;
  }
  
  .tl-slidenav-next:active .tl-slidenav-icon {
    margin-left: 80px; /* 100 - 20px */
  }
  
  .tl-slidenav-previous:hover .tl-slidenav-icon {
    margin-left: 0px; /* reset on mobile */
    opacity: 1;
  }
  
  .tl-slidenav-previous:active .tl-slidenav-icon {
    margin-left: -4px;
  }
}

.tl-layout-portrait.tl-mobile {
  .tl-slidenav-next:hover .tl-slidenav-icon {
    opacity: 0.33;
  }
  
  .tl-slidenav-next:active .tl-slidenav-icon {
    opacity: 1;
  }
  
  .tl-slidenav-previous:hover .tl-slidenav-icon {
    opacity: 0.33;
  }
  
  .tl-slidenav-previous:active .tl-slidenav-icon {
    opacity: 1;
  }
}

/* Hide navigation on mobile devices */
.tl-mobile .tl-slidenav-previous,
.tl-mobile .tl-slidenav-next,
.tl-skinny.tl-mobile .tl-slidenav-previous,
.tl-skinny.tl-mobile .tl-slidenav-next,
.tl-skinny.tl-layout-landscape.tl-mobile .tl-slidenav-previous,
.tl-skinny.tl-layout-landscape.tl-mobile .tl-slidenav-next,
.tl-skinny.tl-layout-portrait.tl-mobile .tl-slidenav-previous,
.tl-skinny.tl-layout-portrait.tl-mobile .tl-slidenav-next {
  display: none;
}
</style>

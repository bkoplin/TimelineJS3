<script setup lang="ts">
// Define props
const props = withDefaults(
  defineProps<{
    direction: 'previous' | 'next'
    title?: string
    date?: string
    inverted?: boolean
    visible?: boolean
  }>(),
  {
    title: '',
    date: '',
    inverted: false,
    visible: true,
  },
)

// Define emits
const emit = defineEmits<{
  (e: 'clicked', direction: 'previous' | 'next'): void
}>()

// Computed properties for styling and content

const iconContent = computed(() => {
  return props.direction === 'next' ? byPrefixAndName.fas['chevron-right'] : byPrefixAndName.fas['chevron-left']
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
    class="tl-slidenav-button absolute top-[45%] z-10 cursor-pointer p-0 bg-transparent border-none text-inherit lt-md-hidden"
    :class="{
      'tl-slidenav-previous text-left left-0 pl-2': props.direction === 'previous',
      'tl-slidenav-next text-right right-0 pr-2': props.direction === 'next',
    }"
    :aria-label="ariaLabel"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <div
      class="tl-slidenav-content-container w-25 flex flex-col"
      :class="{
        'text-white': props.inverted, // 100px width
        'items-start': props.direction === 'previous',
        'items-end': props.direction === 'next',
      }"
    >
      <!-- Icon -->
      <FontAwesomeIcon
        class="text-4xl leading-none antialiased visible"
        :icon="iconContent"
      />

      <!-- Title -->
      <div
        class="tl-slidenav-title mt-2.5 text-xs leading-tight w-full line-clamp-2 text-ellipsis opacity-15"
        :class="{
          'ml-0.5': props.direction === 'previous',
          'mr-0.5': props.direction === 'next',
        }"
      >
        {{ title }}
      </div>

      <!-- Description (Date) -->
      <div
        class="tl-slidenav-description text-xs mt-1.25 w-full line-clamp-1 text-ellipsis opacity-0"
        :class="{
          'ml-0.5': props.direction === 'previous',
          'mr-0.5': props.direction === 'next',
        }"
      >
        {{ date }}
      </div>
    </div>
  </button>
</template>

<style scoped>
/* SlideNav styles based on TL.SlideNav.less */

/* Base navigation styles */

/* Hover effects */
.tl-slidenav-button:hover {
  & .tl-slidenav-title {
    @apply opacity-100;
  }

  & .tl-slidenav-description {
    @apply opacity-50;
  }
}


/* Skinny layout - when container is narrow */
.tl-skinny .tl-slidenav-next .tl-slidenav-icon {
  margin-left: 8px; /* 32 - 24px */
}

.tl-skinny .tl-slidenav-previous,
.tl-skinny .tl-slidenav-next {
  & .tl-slidenav-content-container {
    width: 32px;
    height: 32px;
  }

  & .tl-slidenav-title,
  & .tl-slidenav-description {
    display: none;
  }

  & .tl-slidenav-icon {
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
  & .tl-slidenav-next:hover .tl-slidenav-icon {
    margin-left: 76px; /* 100 - 24px - reset on mobile */
    opacity: 1;
  }

  & .tl-slidenav-next:active .tl-slidenav-icon {
    margin-left: 80px; /* 100 - 20px */
  }

  & .tl-slidenav-previous:hover .tl-slidenav-icon {
    margin-left: 0px; /* reset on mobile */
    opacity: 1;
  }

  & .tl-slidenav-previous:active .tl-slidenav-icon {
    margin-left: -4px;
  }
}

.tl-layout-portrait.tl-mobile {
  & .tl-slidenav-next:hover .tl-slidenav-icon {
    opacity: 0.33;
  }

  & .tl-slidenav-next:active .tl-slidenav-icon {
    opacity: 1;
  }

  & .tl-slidenav-previous:hover .tl-slidenav-icon {
    opacity: 0.33;
  }

  & .tl-slidenav-previous:active .tl-slidenav-icon {
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

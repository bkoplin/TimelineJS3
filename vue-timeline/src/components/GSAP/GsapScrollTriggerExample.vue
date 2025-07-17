<script lang="ts" setup>
import { gsap } from '@/composables/useGsap'
import GsapScrollTrigger from './GsapScrollTrigger.vue'

const scrollTriggerRef = ref<InstanceType<typeof GsapScrollTrigger>>()
const targetRef = ref<HTMLElement>()
const toggleBoxRef = ref<HTMLElement>()

// Create animations
onMounted(() => {
  // Animation for toggle actions example
  if (toggleBoxRef.value) {
    gsap.set(toggleBoxRef.value, { x: -100, opacity: 0 })
  }
})

function handleScrollTriggerEnter() {
  // Animate the box when ScrollTrigger enters
  if (targetRef.value) {
    gsap.to(targetRef.value.querySelector('.animated-box'), {
      x: 200,
      rotation: 360,
      backgroundColor: '#ff6b6b',
      duration: 1,
      ease: 'back.out(1.7)',
    })
  }
}

function handleScrollTriggerUpdate() {
  if (scrollTriggerRef.value?.progress) {
    // Progress updated
  }
}

function handleToggleEnter() {
  if (toggleBoxRef.value) {
    gsap.to(toggleBoxRef.value, {
      x: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'back.out(1.7)',
    })
  }
}

function handleToggleLeave() {
  if (toggleBoxRef.value) {
    gsap.to(toggleBoxRef.value, {
      x: -100,
      opacity: 0,
      duration: 0.6,
      ease: 'back.in(1.7)',
    })
  }
}
</script>

<template>
  <div class="scroll-trigger-example">
    <div class="spacer">
      Scroll down to see ScrollTrigger animations
    </div>
    
    <!-- Scroll Animation Example -->
    <GsapScrollTrigger
      ref="scrollTriggerRef"
      start="top center"
      end="bottom center"
      :markers="true"
      @enter="handleScrollTriggerEnter"
      @update="handleScrollTriggerUpdate"
    >
      <div
        ref="targetRef"
        class="animation-container"
      >
        <div class="animated-box">
          Scroll Animation
        </div>
      </div>
    </GsapScrollTrigger>

    <!-- Pin Example -->
    <GsapScrollTrigger
      :pin="true"
      start="top top"
      end="+=300"
      :scrub="true"
      :markers="true"
    >
      <div class="pinned-section">
        <h2>This section is pinned during scroll</h2>
        <p>It stays in place while content scrolls behind it</p>
      </div>
    </GsapScrollTrigger>

    <!-- Snap Example -->
    <GsapScrollTrigger
      :snap="{ snapTo: [0, 0.33, 0.66, 1], duration: { min: 0.2, max: 3 }, delay: 0.2 }"
      start="top top"
      end="bottom bottom"
      :markers="true"
    >
      <div class="snap-container">
        <div class="snap-section">
          <h3>Snap Section 1</h3>
          <p>Scroll snaps to specific progress values</p>
        </div>
        <div class="snap-section">
          <h3>Snap Section 2</h3>
          <p>Progress: 33%</p>
        </div>
        <div class="snap-section">
          <h3>Snap Section 3</h3>
          <p>Progress: 66%</p>
        </div>
        <div class="snap-section">
          <h3>Snap Section 4</h3>
          <p>Progress: 100%</p>
        </div>
      </div>
    </GsapScrollTrigger>

    <!-- Toggle Actions Example -->
    <GsapScrollTrigger
      start="top 80%"
      end="bottom 20%"
      :markers="true"
      @enter="handleToggleEnter"
      @leave="handleToggleLeave"
    >
      <div
        ref="toggleBoxRef"
        class="toggle-box"
      >
        <h3>Toggle Actions</h3>
        <p>This will animate on enter and reverse on leave</p>
      </div>
    </GsapScrollTrigger>

    <!-- Horizontal Scroll Example -->
    <div class="horizontal-scroll-container">
      <div class="horizontal-scroll-content">
        <GsapScrollTrigger
          :horizontal="true"
          start="left right"
          end="right left"
          :scrub="1"
          :markers="true"
        >
          <div class="horizontal-item">
            <h3>Horizontal ScrollTrigger</h3>
            <p>This responds to horizontal scrolling</p>
          </div>
        </GsapScrollTrigger>
        
        <div class="horizontal-item">
          Item 2
        </div>
        <div class="horizontal-item">
          Item 3
        </div>
        <div class="horizontal-item">
          Item 4
        </div>
        <div class="horizontal-item">
          Item 5
        </div>
      </div>
    </div>

    <div class="spacer">
      End of examples
    </div>
  </div>
</template>

<style scoped>
.scroll-trigger-example {
  padding: 2rem;
  min-height: 300vh; /* Make page scrollable */
}

.spacer {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #666;
}

.animation-container {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 1rem;
}

.animated-box {
  width: 150px;
  height: 150px;
  background: #333;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-weight: bold;
}

.pinned-section {
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  padding: 3rem;
  text-align: center;
  border-radius: 1rem;
  color: white;
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.snap-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.snap-section {
  height: 100vh;
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 1rem;
  color: #333;
}

.toggle-box {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  padding: 3rem;
  text-align: center;
  border-radius: 1rem;
  color: #333;
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.horizontal-scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  margin: 2rem 0;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.horizontal-scroll-content {
  display: flex;
  width: 200vw; /* Make it wider than viewport to enable horizontal scroll */
  height: 300px;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

.horizontal-item {
  min-width: 250px;
  height: 200px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #333;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.horizontal-item:hover {
  transform: translateY(-5px);
}
</style>

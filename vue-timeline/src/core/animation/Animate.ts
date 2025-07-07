/**
 * Animation utility for smooth transitions
 */
export function Animate(obj: Element, options: { [x: string]: any; }) {
  const animationOptions = {
    duration: 1000,
    easing: (t) => t,
    ...options
  };
  
  const startTime = performance.now();
  const initialValues: { [key: string]: number } = {};
  const finalValues: { [key: string]: number|string } = {};
  
  // Extract properties to animate
  for (const prop in options) {
    if (prop !== 'duration' && prop !== 'easing' && prop !== 'complete') {
      const value = options[prop];
      if (typeof value === 'string') {
        const matches = value.match(/^([+-]?[\d.]+)(.*)$/);
        if (matches) {
          initialValues[prop] = parseFloat(getComputedStyle(obj)[prop]) || 0;
          finalValues[prop] = parseFloat(matches[1]);
          finalValues[`${prop}Unit`] = matches[2];
        }
      }
    }
  }
  
  // Animation function
  function step(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / animationOptions.duration, 1);
    const easedProgress = animationOptions.easing(progress);
    
    // Update properties
    for (const prop in initialValues) {
      const initialValue = initialValues[prop];
      const finalValue = finalValues[prop] as number;
      const unit = finalValues[`${prop}Unit`] || '';
      const newValue = initialValue + (finalValue - initialValue) * easedProgress;
      obj.style[prop] = `${newValue}${unit}`;
    }
    
    if (progress < 1) {
      requestAnimationFrame(step);
    } else if (typeof animationOptions.complete === 'function') {
      animationOptions.complete();
    }
  }
  
  requestAnimationFrame(step);
  
  return {
    stop: function() {
      // Can't truly stop, but this is a placeholder for the API
    }
  };
}

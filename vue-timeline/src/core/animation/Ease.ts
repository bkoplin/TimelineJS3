/**
 * Ease functions for animations
 */

// Ease in/out quintic
export function easeInOutQuint(t: number) {
  if ((t *= 2) < 1)
    return 0.5 * t * t * t * t * t
  return 0.5 * ((t -= 2) * t * t * t * t + 2)
}

// Ease out strong
export function easeOutStrong(t: number) {
  return (t === 1) ? 1 : 1 - 2 ** (-10 * t)
}

export function isMobileViewport() {
  return window.matchMedia('(max-device-width: 768px)').matches
}

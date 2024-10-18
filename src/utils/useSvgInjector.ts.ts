import { ref, watch, Ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import { useAppStore } from '@/store/app'

export const useSVGInjector = (
  svgRefs: Ref<HTMLElement | null>[],
  fillColor?: boolean,
  homeFooter?: boolean
) => {
  const appStore = useAppStore()
  const route = useRoute()

  const currentRoute = computed(() => route.name)

  // Injection status for each SVG
  const svgInjectionStatus = ref<boolean[]>(Array(svgRefs.length).fill(false))

  // Helper function to determine the active route based on the index
  const isActiveForRoute = (index: number) => {
    const routeMap = {
      home: 0,
      Nfts: 1,
      profile: 2,
      activities: 3,
    }
    const currentRouteIndex = routeMap[currentRoute.value || 0] ?? 4
    return currentRouteIndex === index
  }

  // Function to apply the accent color to the SVG paths
  const applyAccentColorToSVG = (
    container: HTMLElement | null,
    acentColor: string,
    fontColor: string,
    options: {
      active?: boolean
      nftActive?: boolean
      profileActive?: boolean
      activitiesActive?: boolean
    } = {}
  ) => {
    if (!container) return

    const paths = container.querySelectorAll('path')
    if (!paths.length) {
      console.error('No paths found in the SVG to apply the stroke color.')
      return
    }

    paths.forEach((path: SVGPathElement, i: number) => {
      path.style.stroke = acentColor
      if (i === 0 && options.active && homeFooter) path.style.fill = acentColor
      if (i === 1 && options.active && homeFooter) path.style.stroke = fontColor
      if (i === 1 && options.profileActive && homeFooter) {
        path.style.stroke = fontColor
        path.style.fill = acentColor
      }
      if (i !== 0 && options.nftActive && homeFooter) {
        path.style.stroke = fontColor
        path.style.fill = acentColor
      }
      if (i === 0 && options.activitiesActive && homeFooter)
        path.style.fill = acentColor
      if (fillColor) path.setAttribute('fill', acentColor)
    })
  }

  // Function to fetch and inject SVG
  const fetchAndInjectSVG = async (event: Event, index: number) => {
    const target = event.target as HTMLImageElement
    if (!target || !target.src) {
      console.error(`Invalid event target for SVG injection: ${target}`)
      return
    }

    try {
      const response = await fetch(target.src)
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`)

      const svgContent = await response.text()
      const container = svgRefs[index]?.value
      if (container) {
        container.innerHTML = svgContent
        svgInjectionStatus.value[index] = true

        // Apply accent color after injecting SVG
        if (appStore.theme_settings.accent_color) {
          applyAccentColorToSVG(
            container,
            appStore.theme_settings.accent_color,
            appStore.theme_settings.font_color,
            {
              active: isActiveForRoute(index),
              nftActive: currentRoute.value === 'Nfts' && index === 1,
              profileActive: currentRoute.value === 'profile' && index === 2,
              activitiesActive:
                currentRoute.value === 'activities' && index === 4,
            }
          )
        }
      } else {
        console.error(`SVG container at index ${index} is not defined.`)
      }
    } catch (error) {
      console.error(`Error loading SVG at index ${index}:`, error)
    }
  }

  // Watch for changes in accent color and apply changes to existing SVGs
  watch(
    () => appStore.theme_settings.accent_color,
    (newColor) => {
      svgRefs.forEach((ref, index) => {
        const container = ref.value
        if (svgInjectionStatus.value[index] && container) {
          applyAccentColorToSVG(
            container,
            newColor,
            appStore.theme_settings.font_color,
            {
              active: isActiveForRoute(index),
              nftActive: currentRoute.value === 'Nfts' && index === 1,
              profileActive: currentRoute.value === 'profile' && index === 2,
              activitiesActive:
                currentRoute.value === 'activities' && index === 4,
            }
          )
        }
      })
    },
    { immediate: true }
  )

  return {
    svgInjectionStatus,
    fetchAndInjectSVG,
  }
}

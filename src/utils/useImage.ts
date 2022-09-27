import { Theme } from '@arcana/auth'

import { useAppStore } from '@/store/app'

const THEME_NEUTRAL_IMAGES = [
  'google-icon',
  'green-tick',
  'twitter-icon',
  'twitch-icon',
  'reddit-icon',
  'discord-icon',
]

export function useImage() {
  const appStore = useAppStore()

  return function getImage(
    imageName: string,
    theme: Theme = appStore.theme
  ): string {
    if (THEME_NEUTRAL_IMAGES.includes(imageName)) {
      return require(`@/assets/images/${imageName}.png`)
    } else {
      return require(`@/assets/images/${imageName}-${theme}-mode.png`)
    }
  }
}

import { Theme } from '@arcana/auth'

import { useAppStore } from '@/store/app'

const THEME_NEUTRAL_IMAGES = [
  'google-icon',
  'green-tick',
  'twitter-icon',
  'twitch-icon',
  'reddit-icon',
  'discord-icon',
  'ethereum-icon',
  'polygon-icon',
  'arcana-icon',
  'blockchain-icon',
  'info-circle',
]

function useImage() {
  const appStore = useAppStore()

  return function getImage(
    imageName: string,
    theme: Theme = appStore.theme,
    extension: 'png' | 'svg' = 'png'
  ): string {
    if (THEME_NEUTRAL_IMAGES.includes(imageName)) {
      return require(`@/assets/images/${imageName}.${extension}`)
    } else {
      return require(`@/assets/images/${imageName}-${theme}-mode.${extension}`)
    }
  }
}

function getIconAsset(iconPath: string) {
  return require(`@/assets/images/${iconPath}`)
}

export { useImage, getIconAsset }

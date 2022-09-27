import { useAppStore } from '@/store/app'

const THEME_NEUTRAL_IMAGES = [
  'google-icon',
  'green-tick',
  'twitter-icon',
  'twitch-icon',
  'reddit-icon',
  'discord-icon',
]

function useImage() {
  const appStore = useAppStore()

  return function getImage(imageName: string): string {
    if (THEME_NEUTRAL_IMAGES.includes(imageName)) {
      return require(`@/assets/images/${imageName}.png`)
    } else {
      return require(`@/assets/images/${imageName}-${appStore.theme}-mode.png`)
    }
  }
}

function getIconAsset(iconPath: string) {
  return require(`@/assets/images/${iconPath}`)
}

export { useImage, getIconAsset }

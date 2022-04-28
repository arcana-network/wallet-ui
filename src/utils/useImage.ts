import { useAppStore } from '@src/store/app'

const THEME_NEUTRAL_IMAGES = ['google-icon', 'green-tick', 'twitter-icon']

export function useImage() {
  const appStore = useAppStore()

  return function getImage(imageName: string): string {
    if (THEME_NEUTRAL_IMAGES.includes(imageName)) {
      return require(`@src/assets/images/${imageName}.png`)
    } else {
      return require(`@src/assets/images/${imageName}-${appStore.theme}-mode.png`)
    }
  }
}

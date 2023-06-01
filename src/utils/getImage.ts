import { Theme } from '@arcana/auth'

import { useAppStore } from '@/store/app'

function getImage(imgUrl: string, theme?: Theme) {
  const appStore = useAppStore()
  const appTheme = theme || appStore.theme
  return require(`@/assets/images/${appTheme}/${imgUrl}`)
}

export { getImage }

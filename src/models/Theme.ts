type Theme = 'light' | 'dark'

type ThemeConfig = {
  assets: {
    logo: {
      dark: {
        horizontal: string
        vertical: string
      }
      light: {
        horizontal: string
        vertical: string
      }
    }
  }
  theme: Theme
}

export type { Theme, ThemeConfig }

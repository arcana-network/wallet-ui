import { defineStore } from 'pinia'

import type { Theme } from '@/models/Theme'

type AppState = {
  id: string | null
  theme: Theme
  parentAppUrl: string | null
}

export const useAppStore = defineStore('app', {
  state: () =>
    ({
      id: null,
      theme: 'light',
      parentAppUrl: null,
    } as AppState),
  actions: {
    setAppId(id: string): void {
      this.id = id
    },
    setTheme(theme: Theme = 'dark'): void {
      this.theme = theme
    },
    setParentUrl(url: string): void {
      this.parentAppUrl = url
    },
  },
})

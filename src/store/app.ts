import { AppMode } from '@arcana/wallet'
import { defineStore } from 'pinia'

import type { Theme } from '@/models/Theme'

type AppState = {
  id: string | null
  name: string
  theme: Theme
  parentAppUrl: string | null
  appMode: AppMode
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
    setTheme(theme: Theme): void {
      this.theme = theme
    },
    setName(name: string): void {
      this.name = name
    },
    setParentUrl(url: string): void {
      this.parentAppUrl = url
    },
    setAppMode(appMode: AppMode): void {
      this.appMode = appMode
    },
  },
})

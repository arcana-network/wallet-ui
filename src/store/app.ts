import { AppMode } from '@arcana/auth'
import { defineStore } from 'pinia'

import type { Theme } from '@/models/Theme'

type AppState = {
  id: string
  name: string
  theme: Theme
  parentAppUrl: string | null
  validAppMode: AppMode
}

export const useAppStore = defineStore('app', {
  state: () =>
    ({
      id: '',
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
    setAppMode(validAppMode: AppMode): void {
      this.validAppMode = validAppMode
    },
  },
})

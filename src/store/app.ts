import type { Theme } from '@src/models/Theme'
import { defineStore } from 'pinia'

type AppState = {
  id: string | null
  theme: Theme
}

export const useAppStore = defineStore('app', {
  state: () =>
    ({
      id: null,
      theme: 'light',
    } as AppState),
  actions: {
    setAppId(id: string): void {
      this.id = id
    },
    setTheme(theme: Theme): void {
      this.theme = theme
    },
  },
})

import { defineStore } from 'pinia'

import { AppConfig, getAppConfig } from '@/services/gateway.service'
import { devLogger } from '@/utils/devLogger'

export const useConfigStore = async (appID: string) => {
  const configStore = defineStore({
    id: 'config',
    state: () =>
      ({
        appID: '',
        session_persisted: false,
        session_max_age: 0,
        theme: 'dark',
        theme_settings: {},
      } as AppConfig & { appID: string }),
    actions: {
      async getConfig(appID: string) {
        const { data } = await getAppConfig(appID)
        devLogger.log('get-config', data)
        this.appID = appID
        this.name = data.name
        this.chain_type = data.chain_type
        this.global = data.global
        if (data.theme_settings) {
          this.theme_settings = data.theme_settings
        }
        if (data.session_persisted) {
          this.session_persisted = data.session_persisted
        }
        if (data.session_max_age) {
          this.session_max_age = data.session_max_age
        }
        devLogger.log('get-config-end', this)
      },
    },
  })

  const c = configStore()
  if (c.appID !== appID) {
    devLogger.log('get-config-init', c.appID, appID)
    await c.getConfig(appID)
    devLogger.log('get-config-init-complete', c.appID, appID)
  }
  devLogger.log('get-config-return')
  return c
}

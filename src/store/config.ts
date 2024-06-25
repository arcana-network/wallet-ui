import { defineStore } from 'pinia'

import { AppConfig, getAppConfig } from '@/services/gateway.service'
import { devLogger } from '@/utils/devLogger'

export const useConfigStore = async (appID: string) => {
  const configStore = defineStore({
    id: 'config',
    state: () =>
      ({
        appID: '',
        session_persisted: true,
        session_max_age: 5,
        theme: 'dark',
      } as AppConfig & { appID: string }),
    actions: {
      async getConfig(appID: string) {
        const { data } = await getAppConfig(appID)
        devLogger.log('get-config')
        this.appID = appID
        this.name = data.name
        this.chain_type = data.chain_type
        this.global = data.global
        if (data.session_persisted) {
          this.session_persisted = data.session_persisted
        }
        if (data.session_max_age) {
          this.session_max_age = data.session_max_age
        }
        devLogger.log('get-config-end')
      },
    },
  })

  const c = configStore()
  if (c.appID !== appID) {
    devLogger.log('get-config-init')
    await c.getConfig(appID)
  }
  devLogger.log('get-config-return')
  return c
}

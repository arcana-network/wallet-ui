import axios from 'axios'

import { StyleConfig } from '@/models/StyleConfig'
import { API } from '@/utils/constants'

const gatewayInstance = axios.create({ baseURL: API.gateway })

function getGaslessEnabledStatus(appId, chainId) {
  return gatewayInstance.get('/api/v1/gastank/status/', {
    params: { app_id: appId, chain_id: chainId },
  })
}

type AppConfig = {
  name: string
  chain_type: 'evm' | 'solana'
  global: boolean
  theme: 'dark' | 'light'
  session_persisted: boolean
  session_max_age: number
  theme_settings: StyleConfig
}

function getAppConfig(appId: string) {
  return gatewayInstance.get<AppConfig>(`/api/v1/get-app-config/?id=${appId}`)
}

export { getGaslessEnabledStatus, getAppConfig, AppConfig }

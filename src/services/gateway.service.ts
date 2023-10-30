import axios from 'axios'

import { API } from '@/utils/constants'

const gatewayInstance = axios.create({ baseURL: API.gateway })

function getGaslessEnabledStatus(appId, chainId) {
  return gatewayInstance.get('/api/v1/gastank/status/', {
    params: { app_id: appId, chain_id: chainId },
  })
}

function fetchApp(appId: string | number) {
  return gatewayInstance.get(`/api/v1/get-app-config/?id=${appId}`)
}

export { getGaslessEnabledStatus, fetchApp }

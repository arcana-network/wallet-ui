import axios from 'axios'

import { API } from '@/utils/constants'

const gatewayInstance = axios.create({ baseURL: API.gateway })

function getGastankAPIKey(appId, chainId) {
  return gatewayInstance.get('/api/v1/gastank/api-key/', {
    params: { app_address: appId, chain_id: chainId },
  })
}

export { getGastankAPIKey }

import axios from 'axios'

import { API } from '@/utils/constants'

const gatewayInstance = axios.create({ baseURL: API.gateway })

function checkIfGastankConfigured(appId, chainId) {
  return gatewayInstance.get('/api/v1/gastank/status/', {
    params: { app_id: appId, chain_id: chainId },
  })
}

export { checkIfGastankConfigured }

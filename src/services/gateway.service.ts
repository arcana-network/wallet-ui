import axios from 'axios'
import { Wallet, utils } from 'ethers'

import { API } from '@/utils/constants'

const gatewayInstance = axios.create({ baseURL: API.gateway })

function getGaslessEnabledStatus(appId, chainId) {
  return gatewayInstance.get('/api/v1/gastank/status/', {
    params: { app_id: appId, chain_id: chainId },
  })
}

async function alertPrivateKeyExported({
  privateKey,
  loginType,
  appId,
  userId,
}) {
  const wallet = new Wallet(privateKey)
  const nonceResponse = await gatewayInstance.get('/api/v1/get-nonce/', {
    params: {
      address: wallet.address,
    },
  })
  if (nonceResponse.status !== 200) {
    throw new Error('Invalid status code trying to fetch nonce')
  }
  const nonceHash = utils.id(nonceResponse.data).substring(2, 42)
  const sig = await wallet.signMessage(
    `Export key for user ${wallet.address}. \n Nonce: ${nonceHash}`
  )
  return await gatewayInstance.post('/api/v1/export-key/', {
    verifier: loginType,
    client_id: appId,
    user_id: userId,
    address: wallet.address,
    signature: sig,
  })
}

function getAppConfig(appId) {
  return gatewayInstance.get(`/api/v1/get-app-config/?id=${appId}`)
}

export { getGaslessEnabledStatus, getAppConfig, alertPrivateKeyExported }

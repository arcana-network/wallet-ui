import axios from 'axios'

const gatewayUrl = process.env.VUE_APP_WALLET_GATEWAY

const chainListAPI = '/api/v1/chains'
const chainLogoApi = '/api/v1/chain/logo'

async function getEnabledChainList(appId) {
  const url = new URL(`${chainListAPI}/${appId}/`, gatewayUrl)
  return (await axios.get(url.toString())).data
}

function getChainLogoUrl(selectedRpcConfig) {
  if (selectedRpcConfig) {
    if (selectedRpcConfig?.favicon) {
      return selectedRpcConfig.favicon
    }
    const url = new URL(
      `${chainLogoApi}/${Number(selectedRpcConfig?.chainId)}/`,
      gatewayUrl
    )
    return url.toString()
  }
  return ''
}

export { getEnabledChainList, getChainLogoUrl }

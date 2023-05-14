import axios from 'axios'

const gatewayUrl = process.env.VUE_APP_WALLET_GATEWAY

const chainListAPI = '/api/v1/chains'

async function getEnabledChainList(appId) {
  const url = new URL(`${chainListAPI}/${appId}/`, gatewayUrl)
  return (await axios.get(url.toString())).data
}

export { getEnabledChainList }

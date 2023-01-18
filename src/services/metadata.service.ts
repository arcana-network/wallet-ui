import axios from 'axios'

const gatewayUrl = process.env.VUE_APP_WALLET_GATEWAY

type GetMetadataParams = {
  address: string
  signature: string
  appAddress: string
}

function getMetadata(data: GetMetadataParams) {
  return axios.post(`${gatewayUrl}/api/v1/get-metadata/`, data)
}

type SetMetadataParams = {
  address: string
  signature: string
  appAddress: string
  metadata: {
    address: string
    encryptedShare: {
      index: number
      value: string
    }
  }
}

function setMetadata(data: SetMetadataParams) {
  return axios.post(`${gatewayUrl}/api/v1/set-metadata/`, data)
}

function getNonce(address: string) {
  return axios.get(`${gatewayUrl}/api/v1/get-nonce/?address=${address}`)
}

export { getNonce, getMetadata, setMetadata }

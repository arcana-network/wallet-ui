import axios from 'axios'

const gatewayUrl = process.env.VUE_APP_WALLET_GATEWAY

type GetMetadataParams = {
  address: string
  signature: string
  appAddress: string
}

function getMetadata(data: GetMetadataParams) {
  const url = new URL('/api/v1/get-metadata/', gatewayUrl)
  return axios.post(url.toString(), data)
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
  const url = new URL('/api/v1/set-metadata/', gatewayUrl)
  return axios.post(url.toString(), data)
}

function getNonce(address: string) {
  const url = new URL(`/api/v1/get-nonce/?address=${address}`, gatewayUrl)
  return axios.post(url.toString())
}

export { getNonce, getMetadata, setMetadata }

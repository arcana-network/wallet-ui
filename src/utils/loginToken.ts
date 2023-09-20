import axios from 'axios'
import { ethers } from 'ethers'

// eslint-disable-next-line no-undef
const OAUTH_URL = process.env.VUE_APP_OAUTH_SERVER_URL

async function getLoginToken({
  provider,
  token,
  signerAddress,
  userID,
  appID,
  privateKey,
}) {
  const wallet = new ethers.Wallet(privateKey)
  const nonce = await getNonce(wallet.address)
  const msg = [provider, token, nonce, signerAddress, userID, appID].join(':')
  const signature = await wallet.signMessage(msg)
  const url = new URL('/api/v2/loginToken', OAUTH_URL)

  const res = await axios.post<{ token: string }>(url.toString(), {
    provider,
    token,
    signature,
    signerAddress,
    userID,
    appID,
  })
  if (res.status !== 200) {
    throw new Error('Could not get login token')
  }
  return res.data.token
}

const getNonce = async (address: string) => {
  const url = new URL('/api/v2/loginNonce', OAUTH_URL)
  url.searchParams.append('address', address)
  const res = await axios.get<{ nonce: number }>(url.toString())
  return res.data.nonce
}

export { getLoginToken }

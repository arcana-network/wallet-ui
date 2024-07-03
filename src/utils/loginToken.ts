import { personalSign } from '@metamask/eth-sig-util'
import {
  signAsync as ed25519Sign,
  etc,
  getPublicKeyAsync,
} from '@noble/ed25519'
import { Keypair } from '@solana/web3.js'
import axios from 'axios'
import base58 from 'bs58'
import dayjs from 'dayjs'
import {
  addHexPrefix,
  fromUtf8,
  privateToPublic,
  stripHexPrefix,
} from 'ethereumjs-util'
import { privateKeyToAccount } from 'viem/accounts'
// eslint-disable-next-line no-undef
const OAUTH_URL = process.env.VUE_APP_OAUTH_SERVER_URL

async function getLoginToken({
  provider,
  token,
  userID,
  appID,
  privateKey,
  curve,
}) {
  const address = await getAddress(privateKey, curve)
  const nonce = await getNonce(address)
  const c = curve == 'secp256k1' ? 'secp256k1' : 'ed25519'
  const msg = [provider, token, nonce, address, userID, appID, c].join(':')
  const signature = await sign(curve)(privateKey, msg)
  const url = new URL('/api/v2/loginToken', OAUTH_URL)

  const res = await axios.post<{ token: string }>(url.toString(), {
    provider,
    token,
    signature,
    signerAddress: address,
    userID,
    appID,
    curve: c,
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

type GetDIDInput = {
  privateKey: string
  curve: 'secp256k1' | 'ed25519'
  userID: string
  appID: string
}

const getUserDIDToken = async (input: GetDIDInput) => {
  const now = dayjs()
  const claims = JSON.stringify({
    iss: await privateToPublicKey(input.privateKey, input.curve), // hex encoded for evm, b58 for solana
    iat: now.unix(),
    nbf: now.unix(),
    exp: now.add(60, 'minutes').unix(),
    aud: input.appID, // appID
    sub: input.userID,
    nonce: getRandomUUID(),
  })
  const proof = await sign(input.curve)(input.privateKey, claims)
  const token = window.btoa(JSON.stringify([proof, claims]))
  return token
}

const getRandomUUID = () => {
  // try {
  //   if (self.crypto?.randomUUID) {
  //     return self.crypto.randomUUID()
  //   }
  //   throw 'insecure context'
  // } catch (e) {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  )
  // }
}

const sign = (curve: 'secp256k1' | 'ed25519') => {
  return async (privateKey: string, data: string) => {
    if (curve === 'secp256k1') {
      const msgToSign = addHexPrefix(Buffer.from(data).toString('hex'))
      return personalSign({
        privateKey: Buffer.from(stripHexPrefix(privateKey), 'hex'),
        data: msgToSign,
      })
    } else {
      const kp = Keypair.fromSeed(etc.hexToBytes(privateKey))
      const sig = await ed25519Sign(
        stripHexPrefix(fromUtf8(data)),
        kp.secretKey.slice(0, 32)
      )
      return etc.bytesToHex(sig)
    }
  }
}

const getAddress = async (
  privateKey: string,
  curve: 'secp256k1' | 'ed25519'
) => {
  if (curve == 'secp256k1') {
    const wallet = privateKeyToAccount(`0x${privateKey}`)
    return wallet.address
  } else {
    return await privateToPublicKey(privateKey, 'ed25519')
  }
}

const privateToPublicKey = async (
  privateKey: string,
  curve: 'secp256k1' | 'ed25519'
) => {
  if (curve === 'secp256k1') {
    const publicKey = privateToPublic(
      Buffer.from(stripHexPrefix(privateKey), 'hex')
    )
    return publicKey.toString('hex')
  } else {
    const pkBytes = etc.hexToBytes(privateKey)
    const publicKey = await getPublicKeyAsync(pkBytes)
    return base58.encode(publicKey)
  }
}
export { getLoginToken, getUserDIDToken }

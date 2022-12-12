import { v4 as uuid } from 'uuid'

import { getRandomPrivateKey, sign, decrypt } from '@/utils/crypto'

const OAUTH_URL = process.env.VUE_APP_OAUTH_SERVER_URL

class PasswordlessLoginHandler {
  readonly pollingPeriod = 2000
  readonly waitingPeriod = 3000
  private sessionId: string
  private timer: number | undefined
  private key: {
    publicKey: string
    privateKey: string
    address: string
  }
  constructor(private email: string) {
    this.sessionId = uuid()
    this.key = getRandomPrivateKey()
    this.timer = undefined
  }

  params = () => {
    return {
      sessionId: this.sessionId,
      setToken: this.createSignature('set'),
    }
  }

  createSignature = (kind: 'create' | 'get' | 'set') => {
    const msg = `${kind},${this.sessionId}`
    const sig = sign(msg, this.key.privateKey)
    return sig
  }

  start = (): Promise<{
    privateKey: string
    email: string
  }> => {
    return new Promise((resolve, reject) => {
      this.createCredential().then(async () => {
        await new Promise((r) => window.setTimeout(r, this.waitingPeriod))
        this.timer = window.setInterval(async () => {
          try {
            const ciphertext = await this.checkCredentialSet()
            if (ciphertext) {
              const plaintext = await decrypt(ciphertext, this.key.privateKey)
              resolve({
                privateKey: plaintext,
                email: this.email,
              })
            }
          } catch (e) {
            reject(e)
            return
          }
        }, this.pollingPeriod)
      })
    })
  }

  async checkCredentialSet() {
    const url = new URL(`/api/cred/${this.sessionId}`, OAUTH_URL)
    url.searchParams.append('sig', this.createSignature('get'))
    const res = await fetch(url.toString(), {
      method: 'GET',
    })

    if (res.status >= 400) {
      if (res.status == 403 || res.status == 500) {
        clearTimeout(this.timer)
        throw new Error('Could not verify credentials')
      }
      return
    }

    clearTimeout(this.timer)
    const data: { ciphertext: string } = await res.json()
    return data.ciphertext
  }

  async createCredential() {
    const url = new URL(`/api/cred`, OAUTH_URL)
    const res = await fetch(url.toString(), {
      method: 'POST',
      body: JSON.stringify({
        publicKey: this.key.publicKey,
        sessionId: this.sessionId,
        signature: this.createSignature('create'),
      }),
    })
    if (res.status >= 400) {
      throw new Error('Could not start login')
    }
  }

  cancel() {
    clearTimeout(this.timer)
  }
}

const setCredential = async (
  signature: string,
  sessionId: string,
  ciphertext: string
) => {
  const url = new URL(`/api/cred`, OAUTH_URL)

  const res = await fetch(url.toString(), {
    method: 'PUT',
    body: JSON.stringify({
      sessionId,
      signature,
      ciphertext,
    }),
  })
  if (res.status >= 400) {
    throw new Error('Could not update credentials')
  }
}

const getCredentialKey = async (sessionId: string) => {
  const url = new URL(`/api/cred/key/${sessionId}`, OAUTH_URL)

  const res = await fetch(url.toString(), {
    method: 'GET',
  })
  if (res.status >= 400) {
    throw new Error('Could not fetch credential key')
  }

  const data = await res.json()
  return data.publicKey
}

export { PasswordlessLoginHandler, setCredential, getCredentialKey }

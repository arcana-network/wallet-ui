import { GetInfoOutput } from '@arcana/auth-core'
import axios from 'axios'
import { sign, hash } from 'eth-crypto'

const OAUTH_URL = process.env.VUE_APP_OAUTH_SERVER_URL

type UInfo = GetInfoOutput & {
  hasMfa?: boolean | undefined
  pk?: string | undefined
}

class PasskeyLoginHandler {
  static async startLogin(appID: string) {
    const res = await axios.get(
      new URL(`/api/v1/passkey/login/start/${appID}`, OAUTH_URL).toString(),
      { withCredentials: true }
    )
    return res.data
  }

  static async finishLogin(params: any, appID: string) {
    const res = await axios.post<{ token: string; userID: string }>(
      new URL(`/api/v1/passkey/login/verify/${appID}`, OAUTH_URL).toString(),
      params,
      { withCredentials: true }
    )
    return res.data
  }
  private userInfo: UInfo
  private appID: string
  constructor(info: UInfo, appID: string) {
    this.userInfo = info
    this.appID = appID
  }

  async isPasskeyEnabled() {
    try {
      const res = await axios.post<{ enabled: boolean }>(
        new URL(`/api/v1/passkey/enabled`, OAUTH_URL).toString(),
        {
          userID: this.userInfo.userInfo.id,
          appID: this.appID,
        }
      )
      return res.data.enabled
    } catch (e) {
      return false
    }
  }

  async startLinkPasskey() {
    const isPasskeyEnabled = await this.isPasskeyEnabled()
    console.log({ isPasskeyEnabled, userInfo: this.userInfo })
    const param = {
      userID: this.userInfo.userInfo.id,
      appID: this.appID,
    }
    if (!isPasskeyEnabled) {
      const h = hash.keccak256(`${param.userID},${param.appID},0`)
      const sig = sign(`0x${this.userInfo.pk}`, h)

      const res = await axios.post<{ userID: string }>(
        new URL('/api/v1/passkey/enable', OAUTH_URL).toString(),
        {
          userID: this.userInfo.userInfo.id,
          appID: this.appID,
          provider: this.userInfo.loginType,
          sig,
        }
      )
      if (res.status != 200) {
        throw Error('could not enable passkey')
      }
    }

    const nonceResponse = await axios.post<{ nonce: number }>(
      new URL(`/api/v1/passkey/nonce`, OAUTH_URL).toString(),
      {
        userID: this.userInfo.userInfo.id,
        appID: this.appID,
        provider: this.userInfo.loginType,
      }
    )
    const h = hash.keccak256(
      `${param.userID},${param.appID},${nonceResponse.data.nonce}`
    )
    const sig2 = sign(`0x${this.userInfo.pk}`, h)
    const startRegisterResponse = await axios.post(
      new URL(`/api/v1/passkey/link/start`, OAUTH_URL).toString(),
      {
        userID: this.userInfo.userInfo.id,
        appID: this.appID,
        provider: this.userInfo.loginType,
        sig: sig2,
      },
      { withCredentials: true }
    )
    return startRegisterResponse.data
  }

  async finishLinkPasskey(params: any) {
    try {
      const res = await axios.post<{ success: boolean }>(
        new URL(`/api/v1/passkey/link/verify`, OAUTH_URL).toString(),
        params,
        { withCredentials: true }
      )
      return res.data.success == true
    } catch (e) {
      return false
    }
  }
}

export { PasskeyLoginHandler }

import { GetInfoOutput } from '@arcana/auth-core'
import axios from 'axios'
import { sign, hash } from 'eth-crypto'

import { devLogger } from '@/utils/devLogger'

const OAUTH_URL = process.env.VUE_APP_OAUTH_SERVER_URL

type UInfo = GetInfoOutput & {
  hasMfa?: boolean | undefined
  pk?: string | undefined
}

type PasskeyCred = {
  id: string
  authenticatorName: string
  browser: string
  os: string
  createdAt: string
}

class PasskeyLoginHandler {
  private token?: string
  private tokenExpiry?: number
  static async startLogin(appID: string) {
    const res = await axios.get<{ sid: string; loginParams: any }>(
      new URL(`/api/v2/passkey/login/start/${appID}`, OAUTH_URL).toString()
    )
    return { sid: res.data.sid, loginParams: res.data.loginParams }
  }

  static async finishLogin(sid: string, params: any, appID: string) {
    const res = await axios.post<{ token: string; userID: string }>(
      new URL(
        `/api/v2/passkey/login/verify/${appID}/${sid}`,
        OAUTH_URL
      ).toString(),
      params
    )
    return res.data
  }

  static async startRegistration(appID: string, displayName: string) {
    const u = new URL(`/api/v2/passkey/register/${appID}`, OAUTH_URL)
    if (displayName) {
      u.searchParams.append('displayName', displayName)
    }
    const res = await axios.get<{ sid: string; registrationParams: any }>(
      u.toString()
    )
    return {
      sid: res.data.sid,
      registrationParams: res.data.registrationParams,
    }
  }

  static async finishRegistration(sid: string, params: any) {
    const res = await axios.post<{ token: string; userID: string }>(
      new URL(`/api/v2/passkey/register/verify/${sid}`, OAUTH_URL).toString(),
      params
    )
    return res.data
  }
  private userInfo: UInfo
  private appID: string
  constructor(info: UInfo, appID: string) {
    this.userInfo = info
    this.appID = appID
  }

  async getMyPasskeys() {
    const token = await this.getJWTToken()
    const res = await axios.get<{ creds: PasskeyCred[] }>(
      new URL(`/api/v2/passkey`, OAUTH_URL).toString(),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return res.data.creds
  }

  async unlinkPasskey(id: string) {
    const token = await this.getJWTToken()
    await axios.delete(new URL(`/api/v2/passkey/${id}`, OAUTH_URL).toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async isPasskeyEnabled() {
    try {
      const res = await axios.post<{ enabled: boolean }>(
        new URL(`/api/v2/passkey/enabled`, OAUTH_URL).toString(),
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

  async getJWTToken() {
    if (!this.token || (this.tokenExpiry && Date.now() > this.tokenExpiry)) {
      const param = {
        userID: this.userInfo.userInfo.id,
        appID: this.appID,
      }
      const nonceResponse = await axios.post<{ nonce: number }>(
        new URL(`/api/v2/passkey/nonce`, OAUTH_URL).toString(),
        {
          userID: this.userInfo.userInfo.id,
          appID: this.appID,
          provider: this.userInfo.loginType,
        }
      )
      const h = hash.keccak256(
        `${param.userID},${param.appID},${nonceResponse.data.nonce}`
      )
      const sig = sign(`0x${this.userInfo.pk}`, h)
      const res = await axios.post<{ token: string; expiry: number }>(
        new URL(`/api/v2/passkey/token`, OAUTH_URL).toString(),
        {
          userID: this.userInfo.userInfo.id,
          appID: this.appID,
          provider: this.userInfo.loginType,
          sig,
        }
      )
      this.token = res.data.token
      this.tokenExpiry = res.data.expiry
    }
    return this.token
  }

  async startLinkPasskey() {
    const isPasskeyEnabled = await this.isPasskeyEnabled()
    devLogger.log({ isPasskeyEnabled, userInfo: this.userInfo })
    const param = {
      userID: this.userInfo.userInfo.id,
      appID: this.appID,
    }
    if (!isPasskeyEnabled) {
      const h = hash.keccak256(`${param.userID},${param.appID},0`)
      const sig = sign(`0x${this.userInfo.pk}`, h)
      const res = await axios.post<{ userID: string }>(
        new URL('/api/v2/passkey/enable', OAUTH_URL).toString(),
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
    const token = await this.getJWTToken()
    const startRegisterResponse = await axios.get(
      new URL(`/api/v2/passkey/link/start`, OAUTH_URL).toString(),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return {
      sid: startRegisterResponse.data.sid,
      linkParams: startRegisterResponse.data.registrationParams,
    }
  }

  async finishLinkPasskey(sid: string, params: any) {
    try {
      const res = await axios.post<{ success: boolean }>(
        new URL(`/api/v2/passkey/link/verify/${sid}`, OAUTH_URL).toString(),
        params,
        {
          headers: {
            Authorization: `Bearer ${await this.getJWTToken()}`,
          },
        }
      )
      return res.data.success == true
    } catch (e) {
      return false
    }
  }
}

export { PasskeyLoginHandler }

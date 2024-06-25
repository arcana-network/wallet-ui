import dayjs from 'dayjs'
import { useRoute } from 'vue-router'

import { devLogger } from '@/utils/devLogger'
import {
  BaseStorage,
  LocalStorage,
  SessionStorage,
  StorageType,
  UserInfo,
} from '@/utils/storage'

type StorageInstance = {
  local: LocalStorage
  session: SessionStorage
}

let storageInstance: StorageInstance

function getStorage() {
  return storageInstance
}

function initStorage(appId?: string) {
  if (!appId) {
    const route = useRoute()
    appId = String(route.params.appId)
  }
  storageInstance = {
    local: new LocalStorage(appId),
    session: new SessionStorage(appId),
  }
}

class SensitiveStorage {
  readonly key = 'xar-user-info'
  private userInfo: (UserInfo & { expiry: number }) | null = null
  private storage: BaseStorage
  private type: 'local' | 'session'
  private expiryInMinutes: number
  constructor(sessionEnabled: boolean, appId: string, expiryInMinutes = 300) {
    devLogger.log({ sessionEnabled })
    this.type = sessionEnabled ? 'local' : 'session'
    this.expiryInMinutes = expiryInMinutes
    this.storage = new BaseStorage(this.type, appId)
    this.hydrate()

    window.onbeforeunload = () => {
      this.stash()
    }
    // If tab is changed and user closes without focusing on it, or closing the whole browser
    // Also helpful for mobile devices
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stash()
      } else {
        this.hydrate()
      }
    })
  }

  setUserInfo(userInfo: UserInfo) {
    const expiry = dayjs().add(this.expiryInMinutes, 'minutes')
    this.userInfo = { ...userInfo, expiry: expiry.unix() }
  }

  getUserInfo() {
    if (this.userInfo) {
      if (this.type === 'local' && this.userInfo.expiry < dayjs().unix()) {
        this.userInfo = null
      }
    }
    return this.userInfo
  }

  stash = () => {
    devLogger.log('sensitive-storage:stash')
    devLogger.log({ stash: this.userInfo })

    if (this.userInfo) {
      this.storage.set(this.key, this.userInfo)
    }
  }

  private hydrate() {
    devLogger.log('sensitive-storage:hydrate')
    const userInfo = this.storage.get<UserInfo & { expiry: number }>(this.key)
    devLogger.log({ hydrate: userInfo, this: this.userInfo })
    if (userInfo) {
      this.userInfo = userInfo
      this.storage.delete(this.key)
    }
  }
}

let sensitiveStorage: SensitiveStorage | null = null

const getSensitiveStorage = () => {
  if (!sensitiveStorage) {
    throw new Error('sensitive storage is not initialized!')
  }
  return sensitiveStorage
}
const initSensitiveStorage = (
  sessionEnabled: boolean,
  sessionExpiry: number,
  appId: string
) => {
  if (!sensitiveStorage) {
    sensitiveStorage = new SensitiveStorage(
      sessionEnabled,
      appId,
      sessionExpiry
    )
  }
}

export {
  initSensitiveStorage,
  getSensitiveStorage,
  getStorage,
  initStorage,
  StorageType,
}

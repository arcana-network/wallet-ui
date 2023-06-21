import { useRoute } from 'vue-router'

import { UserStorage } from '@/utils/storage'

type StorageScope = 'local' | 'session'
interface SimplifiedStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

class InMemoryStorage {
  map = new Map<string, string>()

  getItem(key: string): string | null {
    const v = this.map.get(key)
    return v != null ? v : null
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value)
  }

  removeItem(key: string) {
    this.map.delete(key)
  }
}

class StorageWrapper {
  private readonly appAddress: string
  private readonly clientStorage: SimplifiedStorage

  constructor(scope: StorageScope, appId?: string) {
    const route = useRoute()
    this.appAddress = appId ? appId : String(route.params.appId)

    const storage =
      scope === 'local' ? window.localStorage : window.sessionStorage
    if (storage == null || !storage.enabled) {
      this.clientStorage = new InMemoryStorage()
    } else {
      this.clientStorage = storage
    }
  }

  setItem(key: string, value: string) {
    return this.clientStorage.setItem(`${this.appAddress}-${key}`, value)
  }

  getItem(key: string) {
    return this.clientStorage.getItem(`${this.appAddress}-${key}`)
  }

  removeItem(key: string) {
    return this.clientStorage.removeItem(`${this.appAddress}-${key}`)
  }
}

type StorageInstance = {
  local: StorageWrapper
  session: StorageWrapper
}

let storageInstance: StorageInstance
let userStore: UserStorage

function getUserStorage() {
  return userStore
}

function initUserStorage() {
  userStore = new UserStorage()
}

function getStorage() {
  return storageInstance
}

function initStorage(appId?: string) {
  storageInstance = {
    local: new StorageWrapper('local', appId),
    session: new StorageWrapper('session', appId),
  }
}

export { getStorage, initStorage, getUserStorage, initUserStorage }
export type { StorageWrapper }

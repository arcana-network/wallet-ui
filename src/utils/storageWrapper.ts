import { useRoute } from 'vue-router'

type StorageScope = 'local' | 'session'

class StorageWrapper {
  private readonly appAddress: string
  private readonly clientStorage: Storage

  constructor(scope: StorageScope, appId?: string) {
    const route = useRoute()
    this.appAddress = appId ? appId : String(route.params.appId)
    this.clientStorage = scope === 'local' ? localStorage : sessionStorage
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

  clear() {
    return this.clientStorage.clear()
  }
}

type StorageInstance = {
  local: StorageWrapper
  session: StorageWrapper
}

let storageInstance: StorageInstance

function getStorage() {
  return storageInstance
}

function initStorage(appId?: string) {
  storageInstance = {
    local: new StorageWrapper('local', appId),
    session: new StorageWrapper('session', appId),
  }
}

export { getStorage, initStorage }

import { useRoute } from 'vue-router'

type StorageScope = 'local' | 'session'

interface SimplifiedStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

enum StorageType {
  BROWSER,
  IN_MEMORY,
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
  public readonly storageType: StorageType

  constructor(scope: StorageScope, appId?: string) {
    const route = useRoute()
    this.appAddress = appId ? appId : String(route.params.appId)

    const storage =
      scope === 'local' ? window.localStorage : window.sessionStorage

    let works = false
    try {
      storage.setItem('_', '_')
      works = storage.getItem('_') === '_'
    } catch (e) {
      console.log(
        "Local or session storage doesn't work, falling back to In-Memory storage."
      )
      console.error(e)
    }

    if (storage == null || !works) {
      this.clientStorage = new InMemoryStorage()
      this.storageType = StorageType.IN_MEMORY
    } else {
      this.clientStorage = storage
      this.storageType = StorageType.BROWSER
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

function getStorage() {
  return storageInstance
}

function initStorage(appId?: string) {
  storageInstance = {
    local: new StorageWrapper('local', appId),
    session: new StorageWrapper('session', appId),
  }
}

export { getStorage, initStorage, StorageType }
export type { StorageWrapper }

import { useRoute } from 'vue-router'

import { LocalStorage, SessionStorage, StorageType } from '@/utils/storage'

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

export { getStorage, initStorage, StorageType }

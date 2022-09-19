import type { Connection } from 'penpal'
import { defineStore } from 'pinia'

import type { ParentConnectionApi } from '@/models/Connection'

type ParentConnectionState = {
  parentConnection: Connection<ParentConnectionApi> | null
}

export const useParentConnectionStore = defineStore('parentConnection', {
  state: () =>
    ({
      parentConnection: null,
    } as ParentConnectionState),
  actions: {
    setParentConnection(connection: Connection<ParentConnectionApi>): void {
      this.parentConnection = connection
    },
  },
})

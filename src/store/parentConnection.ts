import type { Connection } from 'penpal'
import { defineStore } from 'pinia'

import type {
  ParentConnectionApi,
  InitParentConnectionApi,
} from '@/models/Connection'

type ParentConnectionState = {
  parentConnection: Connection<
    ParentConnectionApi | InitParentConnectionApi
  > | null
}

export const useParentConnectionStore = defineStore('parentConnection', {
  state: () =>
    ({
      parentConnection: null,
    } as ParentConnectionState),
  actions: {
    setParentConnection(
      connection: Connection<ParentConnectionApi | InitParentConnectionApi>
    ): void {
      this.parentConnection = connection
    },
  },
})

import { defineStore } from 'pinia'

import { RequestHandler } from '@/utils/requestHandler'

type RequestHandlerState = {
  requestHandler: RequestHandler | null
}

export const useRequestHandlerStore = defineStore('requestHandler', {
  state: () =>
    ({
      requestHandler: null,
    } as RequestHandlerState),
  actions: {
    setRequestHandler(requestHandler: RequestHandler): void {
      this.requestHandler = requestHandler
    },
  },
})

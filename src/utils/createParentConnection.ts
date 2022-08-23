import { connectToParent } from 'penpal'

import {
  ParentConnectionApi,
  InitParentConnectionApi,
} from '@/models/Connection'

function createParentConnection(methods) {
  return connectToParent<ParentConnectionApi>({
    methods,
    debug: process.env.VUE_APP_ENABLE_PENPAL_DEBUG === 'true',
  })
}

function createInitParentConnection(methods) {
  return connectToParent<InitParentConnectionApi>({
    methods,
    debug: process.env.VUE_APP_ENABLE_PENPAL_DEBUG === 'true',
  })
}

export { createInitParentConnection, createParentConnection }

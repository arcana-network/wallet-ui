import { connectToParent } from 'penpal'

import {
  ParentConnectionApi,
  InitParentConnectionApi,
} from '@/models/Connection'

function createParentConnection(methods) {
  return connectToParent<ParentConnectionApi>({
    methods,
    debug: false,
  })
}

function createInitParentConnection(methods) {
  return connectToParent<InitParentConnectionApi>({
    methods,
    debug: false,
  })
}

export { createInitParentConnection, createParentConnection }

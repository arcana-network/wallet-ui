import { connectToParent } from 'penpal'

import {
  ParentConnectionApi,
  InitParentConnectionApi,
} from '@/models/Connection'

function createParentConnection(methods) {
  return connectToParent<ParentConnectionApi>({
    methods,
    debug: true,
  })
}

function createInitParentConnection(methods) {
  return connectToParent<InitParentConnectionApi>({
    methods,
    debug: true,
  })
}

export { createInitParentConnection, createParentConnection }

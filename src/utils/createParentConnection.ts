import { connectToParent } from 'penpal'

import { ParentConnectionApi } from '@/models/Connection'

export function createParentConnection(methods) {
  return connectToParent<ParentConnectionApi>({
    methods,
    debug: true,
  })
}

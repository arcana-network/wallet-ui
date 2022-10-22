import { FileOps } from '@/store/activities'

type FileValues = {
  operation: FileOps
  did?: string
  recipient?: string
  ruleHash?: string
}

const CONTRACT_MAP = {
  uploadInit: {
    operation: 'Upload',
    did: 'did',
  },
  download: {
    operation: 'Download',
    did: 'did',
  },
  updateRuleSet: {
    operation: 'Update Rule',
    did: '_did',
    ruleHash: '_ruleHash',
  },
  deleteFile: {
    operation: 'Delete',
    did: '_did',
  },
  changeFileOwner: {
    operation: 'Transfer Ownership',
    did: '_did',
    recipient: '_newOwner',
  },
}

function getFileKeysFromContract(contractMethod: string): FileValues {
  if (contractMethod && CONTRACT_MAP[contractMethod]) {
    return CONTRACT_MAP[contractMethod]
  }
  return {
    operation: 'Meta Transaction',
  }
}

const CONTRACT_EVENT_CODE =
  '0x7bd21089cf9edb595059a60d1c46af0920f2453eba4ca019c8aa3b2286d6c69b'

export { getFileKeysFromContract, CONTRACT_EVENT_CODE }

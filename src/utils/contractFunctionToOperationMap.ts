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

const CONTRACT_EVENT_CODE = process.env.VUE_APP_CONTRACT_EVENT_CODE

export { getFileKeysFromContract, CONTRACT_EVENT_CODE }

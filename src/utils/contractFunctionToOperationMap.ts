import { FileOps } from '@/store/activities'

type ContractFunction =
  | 'uploadInit'
  | 'checkPermission'
  | 'share'
  | 'revoke'
  | 'deleteFile'
  | 'changeFileOwner'

type ContractParams = '_did' | '_user' | '_newOwner' | '_files'
type ActivityParams = 'did' | 'recepient'

type ContractMapValues = {
  operation: FileOps
  params: {
    key: ContractParams
    activityParam: ActivityParams
    hasMultiple?: true
  }[]
}

type ContractFunctionToOperationMap = {
  [key in ContractFunction]: ContractMapValues
}

const contractFunctions: ContractFunction[] = [
  'uploadInit',
  'checkPermission',
  'share',
  'revoke',
  'deleteFile',
  'changeFileOwner',
]

const contractFunctionToOperationMap: ContractFunctionToOperationMap = {
  uploadInit: {
    operation: 'Upload',
    params: [
      {
        key: '_did',
        activityParam: 'did',
      },
    ],
  },
  checkPermission: {
    operation: 'Download',
    params: [
      {
        key: '_did',
        activityParam: 'did',
      },
    ],
  },
  share: {
    operation: 'Share',
    params: [
      {
        key: '_files',
        activityParam: 'did',
        hasMultiple: true,
      },
      {
        key: '_user',
        activityParam: 'recepient',
        hasMultiple: true,
      },
    ],
  },
  revoke: {
    operation: 'Revoke',
    params: [
      {
        key: '_did',
        activityParam: 'did',
      },
      {
        key: '_user',
        activityParam: 'recepient',
      },
    ],
  },
  deleteFile: {
    operation: 'Delete',
    params: [
      {
        key: '_did',
        activityParam: 'did',
      },
    ],
  },
  changeFileOwner: {
    operation: 'Transfer Ownership',
    params: [
      {
        key: '_did',
        activityParam: 'did',
      },
      {
        key: '_newOwner',
        activityParam: 'recepient',
      },
    ],
  },
}

export { contractFunctions, contractFunctionToOperationMap }
export type { ContractFunction, ContractMapValues }

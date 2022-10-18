import { TransactionResponse } from '@ethersproject/abstract-provider'
import { defineStore } from 'pinia'

import { store } from '@/store'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { AccountHandler } from '@/utils/accountHandler'
import {
  contractFunctions,
  contractFunctionToOperationMap,
} from '@/utils/contractFunctionToOperationMap'
import { parseFileTransaction } from '@/utils/parseFileTransaction'

const userStore = useUserStore(store)
const rpcStore = useRpcStore(store)

type ChainId = number

type TransactionOps =
  | 'Send'
  | 'Receive'
  | 'Contract Deployment'
  | 'Contract Interaction'

type FileOps =
  | 'Upload'
  | 'Download'
  | 'Share'
  | 'Revoke'
  | 'Transfer Ownership'
  | 'Delete'

type ActivityStatus = 'Success' | 'Pending' | 'Unapproved'

type Activity = {
  transaction?: {
    hash: string
    amount: bigint
    nonce: number
    gasLimit: bigint
    gasUsed: bigint
    gasPrice: bigint
    data?: string
  }
  operation: TransactionOps | FileOps
  date: Date
  status: ActivityStatus
  address: {
    from: string
    to?: string | null
  }
  file?: {
    did: string
    recepient?: string
  }
  customToken?: {
    operation: string
    amount: string
    symbol: string
  }
}

type ActivitiesState = {
  activitiesByChainId: {
    [key: ChainId]: Activity[]
  }
}

type CustomTokenActivity = {
  operation: 'Send' | 'Receive'
  amount: string
  symbol: string
}

type TransactionFetchParams = {
  txHash: string
  chainId: ChainId
  customToken?: CustomTokenActivity
}

function getTxOperation(
  transaction: TransactionResponse,
  customToken?: CustomTokenActivity
): TransactionOps {
  if (customToken) {
    return customToken.operation
  }
  if (!transaction.data || transaction.data === '0x') {
    if (transaction.from === userStore.walletAddress) {
      return 'Send'
    }
    if (transaction.to === userStore.walletAddress) {
      return 'Receive'
    }
  } else {
    if (
      transaction.from === userStore.walletAddress &&
      transaction.to === null
    ) {
      return 'Contract Deployment'
    }
  }
  return 'Contract Interaction'
}

export const useActivitiesStore = defineStore('activitiesStore', {
  state: (): ActivitiesState => ({
    activitiesByChainId: {},
  }),
  getters: {
    activities: (state) => {
      return (chainId: ChainId) => state.activitiesByChainId[chainId]
    },
  },
  actions: {
    saveActivity(chainId: ChainId, activity: Activity) {
      if (this.activitiesByChainId[chainId]) {
        this.activitiesByChainId[chainId].unshift(activity)
      } else {
        this.activitiesByChainId[chainId] = [activity]
      }
    },
    updateActivityStatusByTxHash(
      chainId: ChainId,
      txHash: string,
      status: ActivityStatus
    ) {
      const activity = this.activitiesByChainId[chainId].find(
        (activityByChainId) => activityByChainId.transaction?.hash === txHash
      )
      if (activity) activity.status = status
    },
    async fetchAndSaveActivityFromHash({
      txHash,
      chainId,
      customToken,
    }: TransactionFetchParams) {
      const accountHandler = new AccountHandler(userStore.privateKey)
      accountHandler.setProvider(rpcStore.selectedRpcConfig.rpcUrls[0])
      const remoteTransaction = await accountHandler.provider.getTransaction(
        txHash
      )
      const activity: Activity = {
        operation: getTxOperation(remoteTransaction, customToken),
        transaction: {
          hash: txHash,
          amount: remoteTransaction.value.toBigInt(),
          nonce: remoteTransaction.nonce,
          gasLimit: remoteTransaction.gasLimit.toBigInt(),
          gasPrice: remoteTransaction.gasPrice?.toBigInt() || BigInt(0),
          gasUsed: remoteTransaction.gasLimit.toBigInt(),
          data: remoteTransaction.data,
        },
        status: remoteTransaction.blockNumber ? 'Success' : 'Pending',
        date: new Date(),
        address: {
          from: remoteTransaction.from,
          to: remoteTransaction.to,
        },
        customToken,
      }
      this.saveActivity(chainId, activity)
      if (!remoteTransaction.blockNumber) {
        remoteTransaction.wait()
        this.updateActivityStatusByTxHash(chainId, txHash, 'Success')
      }
    },
    async saveFileActivity(chainId: ChainId, data: string) {
      const fileTransaction = parseFileTransaction(data)
      if (contractFunctions.includes(fileTransaction.name)) {
        const map = contractFunctionToOperationMap[fileTransaction.name]
        const didParam = map.params.find(
          (param) => param.activityParam === 'did'
        )
        if (didParam) {
          const recepientParam = map.params.find(
            (param) => param.activityParam === 'recepient'
          )
          if (map.operation === 'Share' && recepientParam) {
            const dids = fileTransaction.args[didParam.key] as string[]
            const recepients = fileTransaction.args[
              recepientParam.key
            ] as string[]
            for (const did of dids) {
              for (const recepient of recepients) {
                const activity: Activity = {
                  operation: map.operation,
                  status: 'Success',
                  date: new Date(),
                  address: {
                    from: userStore.walletAddress,
                  },
                  file: {
                    did,
                    recepient,
                  },
                }
                this.saveActivity(chainId, activity)
              }
            }
          } else {
            const activity: Activity = {
              operation: map.operation,
              status: 'Success',
              date: new Date(),
              address: {
                from: userStore.walletAddress,
              },
              file: {
                did: fileTransaction.args[didParam.key],
                recepient: recepientParam
                  ? fileTransaction.args[recepientParam.key]
                  : undefined,
              },
            }
            this.saveActivity(chainId, activity)
          }
        }
      }
    },
  },
})

export type { ChainId, Activity, TransactionOps, FileOps, ActivityStatus }

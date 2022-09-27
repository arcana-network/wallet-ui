import { defineStore } from 'pinia'

import { AccountHandler } from '@/utils/accountHandler'

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
  transaction: {
    hash: string
    operation: TransactionOps | FileOps
    date: Date
    status: ActivityStatus
    amount: bigint
    nonce: number
    gasLimit: bigint
    gasUsed: bigint
    gasPrice: bigint
  }
  address: {
    from: string
    to: string | undefined | null
  }
  file?: {
    did: string
    recepient: string
  }
}

type ActivitiesState = {
  activitiesByChainId: {
    [key: ChainId]: Activity[]
  }
}

type TransactionFetchParams = {
  txHash: string
  accountHandler: AccountHandler
  chainId: ChainId
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
        this.activitiesByChainId[chainId].push(activity)
      } else {
        this.activitiesByChainId[chainId] = [activity]
      }
    },
    updateActivityStatus(
      chainId: ChainId,
      txHash: string,
      status: ActivityStatus
    ) {
      const activity = this.activitiesByChainId[chainId].find(
        (activityByChainId) => activityByChainId.transaction.hash === txHash
      )
      if (activity) activity.transaction.status = status
    },
    async fetchAndSaveActivityFromHash({
      txHash,
      chainId,
      accountHandler,
    }: TransactionFetchParams) {
      const remoteTransaction = await accountHandler.provider.getTransaction(
        txHash
      )
      const activity: Activity = {
        transaction: {
          hash: txHash,
          amount: remoteTransaction.value.toBigInt(),
          operation: 'Send',
          date: new Date(),
          nonce: remoteTransaction.nonce,
          gasLimit: remoteTransaction.gasLimit.toBigInt(),
          gasPrice: remoteTransaction.gasPrice?.toBigInt() || BigInt(0),
          gasUsed: remoteTransaction.gasLimit.toBigInt(),
          status: remoteTransaction.blockNumber ? 'Success' : 'Pending',
        },
        address: {
          from: remoteTransaction.from,
          to: remoteTransaction.to,
        },
      }
      this.saveActivity(chainId, activity)
      if (!remoteTransaction.blockNumber) {
        remoteTransaction.wait()
        this.updateActivityStatus(chainId, txHash, 'Success')
      }
    },
  },
})

export type { ChainId, Activity, TransactionOps, FileOps, ActivityStatus }

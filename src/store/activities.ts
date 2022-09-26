import { defineStore } from 'pinia'

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
    date: string
    status: ActivityStatus
    amount: number
    nonce: number
    gasLimit: number
    gasUsed: number
    gasPrice: number
    total: number
  }
  address: {
    from: string
    to: string
  }
  file?: {
    did: string
  }
}

type ActivitiesState = {
  activitiesByChainId: {
    [key: ChainId]: Activity[]
  }
}

export const useActivitiesStore = defineStore('activitiesStore', {
  state: (): ActivitiesState => ({
    activitiesByChainId: {},
  }),
  getters: {
    activities: (state: ActivitiesState) => {
      return (chainId) => state.activitiesByChainId[chainId]
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
  },
})

export type { ChainId, Activity, TransactionOps, FileOps, ActivityStatus }

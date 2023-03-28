import { TransactionResponse } from '@ethersproject/abstract-provider'
import { defineStore } from 'pinia'

import { NFT } from '@/models/NFT'
import { store } from '@/store'
import { useUserStore } from '@/store/user'
import { IAccountHandler } from '@/utils/requestHandlerInterfaces'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'

const userStore = useUserStore(store)

type ChainId = string

type TransactionOps =
  | 'Send'
  | 'Receive'
  | 'Contract Deployment'
  | 'Contract Interaction'

type FileOps =
  | 'Upload'
  | 'Download'
  | 'Update Rule'
  | 'Transfer Ownership'
  | 'Delete'
  | 'Meta Transaction'

type ActivityStatus = 'Success' | 'Pending' | 'Unapproved'

type Activity = {
  txHash?: string
  transaction?: {
    hash: string
    amount: bigint
    nonce: number
    gasLimit: bigint
    gasUsed: bigint
    gasPrice: bigint
    data: string
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
    recipient?: string
    ruleHash?: string
  }
  customToken?: {
    operation: string
    amount: string
    symbol: string
  }
  nft?: {
    address: string
    tokenId: string
    imageUrl: string
    collectionName: string
    name: string
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
  recipientAddress?: string
}

type TransactionFetchNftParams = {
  txHash: string
  chainId: ChainId
  nft: NFT
  recipientAddress: string
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

async function getRemoteTransaction(
  accountHandler: IAccountHandler,
  txHash: string
): Promise<TransactionResponse> {
  return new Promise((resolve) => {
    const txInterval = setInterval(async () => {
      const remoteTransaction = await accountHandler.getTransaction(txHash)
      if (remoteTransaction) {
        clearInterval(txInterval)
        return resolve(remoteTransaction)
      }
    }, 3000)
  })
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
      recipientAddress,
    }: TransactionFetchParams) {
      const accountHandler = getRequestHandler().getAccountHandler()
      const remoteTransaction = await getRemoteTransaction(
        accountHandler,
        txHash
      )
      const activity: Activity = {
        operation: getTxOperation(remoteTransaction, customToken),
        txHash,
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
          to: recipientAddress || remoteTransaction.to,
        },
        customToken,
      }
      this.saveActivity(chainId, activity)
      if (!remoteTransaction.blockNumber) {
        const txInterval = setInterval(async () => {
          const remoteTransaction = await accountHandler.getTransaction(txHash)
          if (remoteTransaction.blockNumber) {
            this.updateActivityStatusByTxHash(chainId, txHash, 'Success')
            clearInterval(txInterval)
          }
        }, 3000)
      }
    },
    async fetchAndSaveNFTActivityFromHash({
      txHash,
      chainId,
      nft,
      recipientAddress,
    }: TransactionFetchNftParams) {
      const accountHandler = getRequestHandler().getAccountHandler()
      const remoteTransaction = await getRemoteTransaction(
        accountHandler,
        txHash
      )
      const activity: Activity = {
        operation: 'Send',
        txHash,
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
          to: recipientAddress || remoteTransaction.to,
        },
        nft: {
          address: nft.address,
          tokenId: nft.tokenId,
          imageUrl: nft.imageUrl,
          name: nft.name,
          collectionName: nft.collectionName,
        },
      }
      this.saveActivity(chainId, activity)
      if (!remoteTransaction.blockNumber) {
        const txInterval = setInterval(async () => {
          const remoteTransaction = await accountHandler.getTransaction(txHash)
          if (remoteTransaction.blockNumber) {
            this.updateActivityStatusByTxHash(chainId, txHash, 'Success')
            clearInterval(txInterval)
          }
        }, 3000)
      }
    },
  },
})

export type { ChainId, Activity, TransactionOps, FileOps, ActivityStatus }

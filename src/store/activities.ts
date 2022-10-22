import { TransactionResponse } from '@ethersproject/abstract-provider'
import { ethers, BigNumber, EventFilter } from 'ethers'
import { defineStore } from 'pinia'

import { store } from '@/store'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { AccountHandler } from '@/utils/accountHandler'
import {
  CONTRACT_EVENT_CODE,
  getFileKeysFromContract,
} from '@/utils/contractFunctionToOperationMap'

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
  | 'Update Rule'
  | 'Transfer Ownership'
  | 'Delete'
  | 'Meta Transaction'

type ContractFileActivityMessage = {
  details: {
    did: string
    ephemeralWallet: string
  }
  tx: {
    from: string
    method: string
    nonce: number
    to: string
  }
}

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
    async saveFileActivity(
      chainId: ChainId,
      fileTransaction: ContractFileActivityMessage,
      forwarderAddress: string
    ) {
      const fileKeysFromContract = getFileKeysFromContract(
        fileTransaction.tx.method
      )

      let file
      if (fileKeysFromContract.did) {
        const { did, ruleHash, recipient } = fileKeysFromContract
        file = {
          did: fileTransaction.details[did],
          ruleHash: ruleHash && fileTransaction.details[ruleHash],
          recipient: recipient && fileTransaction.details[recipient],
        }
      }
      const activity: Activity = {
        operation: fileKeysFromContract.operation,
        status: 'Pending',
        date: new Date(),
        address: {
          from: userStore.walletAddress,
        },
        file,
      }
      this.saveActivity(chainId, activity)
      const currentActivity = this.activitiesByChainId[chainId][0]

      const filter: EventFilter = {
        address: forwarderAddress,
        topics: [
          CONTRACT_EVENT_CODE,
          ethers.utils.hexZeroPad(fileTransaction.tx.from, 32),
          ethers.utils.hexZeroPad(fileTransaction.tx.to, 32),
          ethers.utils.hexZeroPad(
            BigNumber.from(fileTransaction.tx.nonce).toHexString(),
            32
          ),
        ],
      }

      const accountHandler = new AccountHandler(userStore.privateKey)
      accountHandler.setProvider(rpcStore.selectedRpcConfig.rpcUrls[0])
      accountHandler.provider.once(filter, async (log) => {
        currentActivity.status = 'Success'
        currentActivity.txHash = log.transactionHash
      })
    },
  },
})

export type { ChainId, Activity, TransactionOps, FileOps, ActivityStatus }

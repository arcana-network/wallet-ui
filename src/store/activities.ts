import { TransactionResponse } from '@ethersproject/abstract-provider'
import { ParsedInstruction } from '@solana/web3.js'
import { ethers, BigNumber, EventFilter } from 'ethers'
import { defineStore } from 'pinia'

import { NFT } from '@/models/NFT'
import { store } from '@/store'
import { useUserStore } from '@/store/user'
import { EVMAccountHandler, SolanaAccountHandler } from '@/utils/accountHandler'
import { ChainType } from '@/utils/chainType'
import {
  CONTRACT_EVENT_CODE,
  getFileKeysFromContract,
} from '@/utils/contractFunctionToOperationMap'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'

const userStore = useUserStore(store)

type ChainId = string | number

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
    gasLimit?: bigint
    gasUsed?: bigint
    gasPrice?: bigint
    data?: string
    computeUnitsConsumed?: bigint
    fee?: bigint
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
    decimals?: number
  }
  nft?: {
    address: string
    tokenId: string
    imageUrl?: string
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
  decimals?: number
}

type TransactionFetchParams = {
  txHash: string
  chainId: ChainId | undefined
  customToken?: CustomTokenActivity
  recipientAddress?: string
  chainType?: ChainType
}

type TransactionFetchNftParams = {
  txHash: string
  chainId: ChainId
  nft: NFT
  recipientAddress: string
  chainType?: ChainType
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
  accountHandler: EVMAccountHandler,
  txHash: string
): Promise<TransactionResponse> {
  return new Promise((resolve) => {
    const txInterval = setInterval(async () => {
      const remoteTransaction = await accountHandler.provider.getTransaction(
        txHash
      )
      if (remoteTransaction) {
        clearInterval(txInterval)
        return resolve(remoteTransaction)
      }
    }, 3000)
  })
}

function decodeLogDataHandleOps(
  transaction: ethers.providers.TransactionResponse
): ethers.utils.Result {
  const abi = [
    'function handleOps((address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes)[],address)',
  ]
  const iface = new ethers.utils.Interface(abi)
  return iface.decodeFunctionData('handleOps', transaction.data)
}

function getAmountUsingCallData(data: string): BigNumber {
  const abi = ['function executeCall(address,uint256,bytes)']
  const iface = new ethers.utils.Interface(abi)
  const decodedData = iface.decodeFunctionData('executeCall', data)
  return decodedData[1]
}

function isGaslessTransaction(
  operation: TransactionOps,
  transaction: TransactionResponse
) {
  const toAddress = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
  const inputDataStartsWithString = '0x1fad948c'
  return (
    operation === 'Contract Interaction' &&
    transaction.to === toAddress &&
    transaction.data.startsWith(inputDataStartsWithString)
  )
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
    saveActivity(chainId: ChainId | undefined, activity: Activity) {
      if (chainId) {
        if (this.activitiesByChainId[chainId]) {
          this.activitiesByChainId[chainId].unshift(activity)
        } else {
          this.activitiesByChainId[chainId] = [activity]
        }
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
      chainType = ChainType.evm_secp256k1,
    }: TransactionFetchParams) {
      try {
        if (chainType === ChainType.solana_cv25519) {
          const accountHandler =
            getRequestHandler().getAccountHandler() as SolanaAccountHandler
          const tx = await accountHandler.getTransaction(txHash)
          if (!tx) {
            setTimeout(() => {
              this.fetchAndSaveActivityFromHash({
                txHash,
                chainId,
                customToken,
                recipientAddress,
                chainType,
              })
            }, 2000)
          } else {
            if (customToken) {
              const activity: Activity = {
                operation: customToken.operation,
                txHash,
                transaction: {
                  hash: txHash,
                  amount: BigInt(customToken.amount),
                  nonce: tx.slot,
                  computeUnitsConsumed: BigInt(
                    tx.meta?.computeUnitsConsumed as number
                  ),
                  fee: BigInt(tx.meta?.fee as number),
                },
                status: 'Success',
                date: new Date(),
                address: {
                  from: userStore.walletAddress,
                  to: recipientAddress,
                },
                customToken,
              }
              this.saveActivity(Number(chainId), activity)
            } else {
              const instructions = tx.transaction.message.instructions
              instructions.forEach((instruction) => {
                const parsedInstruction = instruction as ParsedInstruction
                const activity: Activity = {
                  operation:
                    parsedInstruction.parsed.info.source ===
                    userStore.walletAddress
                      ? 'Send'
                      : 'Receive',
                  txHash,
                  transaction: {
                    hash: txHash,
                    amount: BigInt(parsedInstruction.parsed.info.lamports),
                    nonce: tx.slot,
                    computeUnitsConsumed: BigInt(
                      (tx.meta?.computeUnitsConsumed as number) ?? 0
                    ),
                    fee: BigInt((tx.meta?.fee as number) ?? 0),
                  },
                  status: 'Success',
                  date: new Date(),
                  address: {
                    from: parsedInstruction.parsed.info.source,
                    to:
                      recipientAddress ||
                      parsedInstruction.parsed.info.destination,
                  },
                }
                this.saveActivity(chainId, activity)
              })
            }
          }
        } else {
          const accountHandler =
            getRequestHandler().getAccountHandler() as EVMAccountHandler
          const remoteTransaction = await getRemoteTransaction(
            accountHandler,
            txHash
          )
          const operation = getTxOperation(remoteTransaction, customToken)
          if (isGaslessTransaction(operation, remoteTransaction)) {
            const data = decodeLogDataHandleOps(remoteTransaction)
            const amount = getAmountUsingCallData(data[0][0][3]) // 4th element is the data as per ABI in decodeLogDataHandleOps fn
            remoteTransaction.value = amount
          }
          const activity: Activity = {
            operation: operation,
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
          if (!remoteTransaction?.blockNumber) {
            const txInterval = setInterval(async () => {
              const remoteTransaction =
                await accountHandler.provider.getTransaction(txHash)
              if (remoteTransaction?.blockNumber && chainId) {
                this.updateActivityStatusByTxHash(chainId, txHash, 'Success')
                clearInterval(txInterval)
              }
            }, 3000)
          }
        }
      } catch (err) {
        console.log(err)
      }
    },
    async fetchAndSaveNFTActivityFromHash({
      txHash,
      chainId,
      nft,
      recipientAddress,
      chainType = ChainType.evm_secp256k1,
    }: TransactionFetchNftParams) {
      if (chainType === ChainType.solana_cv25519) {
        const accountHandler =
          getRequestHandler().getAccountHandler() as SolanaAccountHandler
        const tx = await accountHandler.getTransaction(txHash)
        if (!tx) {
          setTimeout(() => {
            this.fetchAndSaveNFTActivityFromHash({
              txHash,
              chainId,
              nft,
              recipientAddress,
              chainType,
            })
          }, 2000)
        } else {
          const activity: Activity = {
            operation: 'Send',
            txHash,
            transaction: {
              hash: txHash,
              amount: BigInt(tx.meta?.fee as number),
              nonce: tx.slot,
              computeUnitsConsumed: BigInt(tx.meta?.computeUnitsConsumed ?? 0),
              fee: BigInt(tx.meta?.fee as number),
            },
            status: 'Success',
            date: new Date(),
            address: {
              from: userStore.walletAddress,
              to: recipientAddress,
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
        }
      } else {
        const accountHandler =
          getRequestHandler().getAccountHandler() as EVMAccountHandler
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
        if (!remoteTransaction?.blockNumber) {
          const txInterval = setInterval(async () => {
            const remoteTransaction =
              await accountHandler.provider.getTransaction(txHash)
            if (remoteTransaction?.blockNumber) {
              this.updateActivityStatusByTxHash(chainId, txHash, 'Success')
              clearInterval(txInterval)
            }
          }, 3000)
        }
      }
    },
    async saveFileActivity(
      chainId: ChainId | undefined,
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
      let currentActivity
      if (chainId) {
        currentActivity = this.activitiesByChainId[chainId][0]
      }

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

      const accountHandler =
        getRequestHandler().getAccountHandler() as EVMAccountHandler
      accountHandler.provider.once(filter, async (log) => {
        currentActivity.status = 'Success'
        currentActivity.txHash = log.transactionHash
      })
    },
  },
})

export type { ChainId, Activity, TransactionOps, FileOps, ActivityStatus }

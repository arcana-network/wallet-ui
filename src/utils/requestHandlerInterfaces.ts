import type { RpcConfig } from '@arcana/auth'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import type { MessageParams, TransactionParams } from 'eth-json-rpc-middleware'
import type { ethers } from 'ethers'
import type { JsonRpcRequest, PendingJsonRpcResponse } from 'json-rpc-engine'
import type { Connection } from 'penpal'

import type { ParentConnectionApi, ProviderEvent } from '@/models/Connection'
import type { NFTContractType } from '@/models/NFT'
import type { TypedMessageParams } from '@/utils/evm/walletMiddleware'

interface IRequestHandler {
  setRpcConfig(c: RpcConfig): Promise<void>
  emitEvent(e: string, params?: ProviderEvent): Promise<void>
  getAccountHandler(): IAccountHandler
  setConnection(connection: Connection<ParentConnectionApi>): void
  reply(
    method: string,
    response: PendingJsonRpcResponse<unknown>
  ): Promise<void>
  request(
    request: JsonRpcRequest<unknown>
  ): Promise<PendingJsonRpcResponse<unknown> | undefined>
}

interface IAccountHandler {
  getBalance(): Promise<ethers.BigNumber>
  setProvider(url: string): void
  asMiddleware(): import('json-rpc-engine').JsonRpcMiddleware<string, unknown>
  sendCustomToken: (
    contractAddress: any,
    recipientAddress: any,
    amount: any,
    gasFees: any
  ) => Promise<any>
  estimateCustomTokenGas: (
    contractAddress: any,
    recipientAddress: any,
    amount: any
  ) => Promise<string>
  sendNft: (
    ercStandard: NFTContractType,
    contractAddress: string,
    from: string,
    to: string,
    tokenId: string,
    amount: number,
    gasFees: string
  ) => Promise<any>
  estimateNftGas: (
    ercStandard: NFTContractType,
    contractAddress: string,
    from: string,
    to: string,
    tokenId: string,
    amount: number
  ) => Promise<string>
  sendTransactionWrapper: (p: TransactionParams) => Promise<string>
  getAccountsWrapper: () => Promise<string[]>
  getEthSignWrapper: (p: MessageParams) => Promise<string>
  getEncryptionPublicKeyWrapper: (from: string) => Promise<string>
  signTransactionWrapper: (p: TransactionParams) => Promise<string>
  personalSignWrapper: (p: MessageParams) => Promise<string>
  decryptWrapper: (p: MessageParams) => Promise<string>
  signTypedMessageV4Wrapper: (p: TypedMessageParams) => Promise<string>
  getAccount(): {
    address: string
    publicKey: string
  }
  getAddress(): string[]
  getChainId(): Promise<number>
  getTransaction(tHash: string | Uint8Array): Promise<TransactionResponse>
  getTokenBalance(
    contractAddress: string | Uint8Array,
    walletAddress: string | Uint8Array
  ): Promise<ethers.BigNumberish>
  getTokenDecimals(contractAddress: string | Uint8Array): Promise<number>
  getTokenSymbol(contractAddress: string | Uint8Array): Promise<string>
}

export type { IRequestHandler, IAccountHandler }

import type { TransactionResponse } from '@ethersproject/abstract-provider'
import { Decimal } from 'decimal.js'
import { cipher, decryptWithPrivateKey } from 'eth-crypto'
import {
  concatSig,
  personalSign,
  signTypedData_v4 as signTypedDataV4,
} from 'eth-sig-util'
import {
  addHexPrefix,
  ecsign,
  isHexString,
  setLengthLeft,
  stripHexPrefix,
} from 'ethereumjs-util'
import { ethers } from 'ethers'

import erc1155abi from '@/abis/erc1155.abi.json'
import erc20abi from '@/abis/erc20.abi.json'
import erc721abi from '@/abis/erc721.abi.json'
import { NFTContractType } from '@/models/NFT'
import { useAppStore } from '@/store/app'
import { useGaslessStore } from '@/store/gasless'
import { useModalStore } from '@/store/modal'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { ChainType } from '@/utils/chainType'
import { errors } from '@/utils/content'
import {
  JsonRpcProviderPlusDestroy,
  produceProviderFromURLString,
} from '@/utils/evm/rpcURLToProvider'
import {
  createWalletMiddleware,
  MessageParams,
  TransactionParams,
  TypedMessageParams,
} from '@/utils/evm/walletMiddleware'
import { scwInstance } from '@/utils/scw'

const rpcStore = useRpcStore()
const userStore = useUserStore()
const modalStore = useModalStore()
const appStore = useAppStore()
const gaslessStore = useGaslessStore()
const SENDIT_APP_ID = process.env.VUE_APP_SENDIT_APP_ID

class EVMAccountHandler {
  wallet: ethers.Wallet
  provider: JsonRpcProviderPlusDestroy

  constructor(privateKey: string, rpcUrl: string) {
    this.wallet = new ethers.Wallet(privateKey)
    this.provider = produceProviderFromURLString(rpcUrl)
  }

  get decimals() {
    return 18
  }

  get gasDecimals() {
    return 9
  }

  getBalance() {
    return this.provider.getBalance(this.getAddress()[0])
  }

  setProvider(url: string) {
    this.provider
      .destroy()
      .catch((e) => console.error('Failed to destroy connection:', e))
    this.provider = produceProviderFromURLString(url)
  }

  asMiddleware() {
    return createWalletMiddleware({
      getAccounts: this.getAccountsWrapper,
      requestAccounts: this.getAccountsWrapper,
      processEncryptionPublicKey: this.getEncryptionPublicKeyWrapper,
      processPersonalMessage: this.personalSignWrapper,
      processEthSignMessage: this.getEthSignWrapper,
      processSignTransaction: this.signTransactionWrapper,
      processTypedMessageV4: this.signTypedMessageV4Wrapper,
      processTransaction: this.sendTransactionWrapper,
      processDecryptMessage: this.decryptWrapper,
      _getPrivateKey: this.getPrivateKey,
      _getAccountType: this.getAccountType,
    })
  }

  getSigner() {
    return this.wallet.connect(this.provider)
  }

  public isSendItApp() {
    const { id: appId } = appStore
    return appId.length > 0 && SENDIT_APP_ID?.includes(appId)
  }

  public async determineTransactionModeAndPaymasterBalance(): Promise<{
    paymasterBalance: ethers.BigNumber
    transactionMode: string
  }> {
    const [nonce, paymasterBalance] = await Promise.all([
      this.getNonceForArcanaSponsorship(userStore.walletAddress),
      scwInstance.getPaymasterBalance() as Promise<ethers.BigNumber>,
    ])
    const thresholdPaymasterBalance = ethers.BigNumber.from(10n ** 17n) // 0.1 × 10¹⁸
    const isSendIt = this.isSendItApp()
    let mode = ''
    if (paymasterBalance.gt(thresholdPaymasterBalance)) {
      if (isSendIt) {
        mode = nonce.lt(15) ? 'ARCANA' : ''
      } else {
        mode = 'SCW'
      }
    }
    return {
      paymasterBalance,
      transactionMode: mode,
    }
  }

  public async determineScwMode() {
    return (await this.determineTransactionModeAndPaymasterBalance())
      .transactionMode
  }

  async getNonceForArcanaSponsorship(
    address: string
  ): Promise<ethers.BigNumber> {
    const c = new ethers.Contract(
      '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
      [
        {
          inputs: [
            {
              internalType: 'address',
              name: 'sender',
              type: 'address',
            },
            {
              internalType: 'uint192',
              name: 'key',
              type: 'uint192',
            },
          ],
          name: 'getNonce',
          outputs: [
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      this.provider
    )

    return await c.getNonce(address, 0)
  }

  getParamsForDoTx(transactionMode) {
    if (transactionMode === 'ARCANA') {
      return {
        mode: 'ARCANA',
        calculateGasLimits: true,
      }
    } else return { mode: transactionMode }
  }

  sendCustomToken = async (
    contractAddress,
    recipientAddress,
    amount,
    gasPrice,
    gasLimit
  ) => {
    const abi = [
      'function transfer(address recipient, uint256 amount) returns (bool)',
    ]

    if (rpcStore.useGasless) {
      const Erc20Interface = new ethers.utils.Interface(abi)
      const encodedData = Erc20Interface.encodeFunctionData('transfer', [
        recipientAddress,
        amount,
      ])
      const txParams = {
        from: userStore.walletAddress,
        to: contractAddress,
        data: encodedData,
      }
      const transactionMode = await this.determineScwMode()
      const tx = await scwInstance.doTx(
        txParams,
        this.getParamsForDoTx(transactionMode)
      )
      const txDetails = await tx.wait()
      gaslessStore.canUseWalletBalance = null
      return txDetails.receipt.transactionHash
    } else {
      const signer = this.wallet.connect(this.provider)
      const contract = new ethers.Contract(contractAddress, abi, signer)
      const payload = {} as any
      if (gasPrice) payload.gasPrice = gasPrice
      if (gasLimit) payload.gasLimit = gasLimit
      const tx = await contract.functions.transfer(
        recipientAddress,
        amount,
        payload
      )
      return tx.hash
    }
  }

  estimateCustomTokenGas = async (
    contractAddress,
    recipientAddress,
    amount
  ) => {
    const abi = [
      'function transfer(address recipient, uint256 amount) returns (bool)',
    ]
    const signer = this.wallet.connect(this.provider)
    const contract = new ethers.Contract(contractAddress, abi, signer)
    const gasLimit = await contract.estimateGas.transfer(
      recipientAddress,
      amount
    )
    return Number(gasLimit) * 2
  }

  sendNft = async (
    ercStandard: NFTContractType,
    contractAddress: string,
    from: string,
    to: string,
    tokenId: string,
    amount: number,
    gasPrice: string,
    gasLimit?: string | number
  ) => {
    const signer = this.wallet.connect(this.provider)
    const payload = {} as any
    if (gasPrice) {
      payload.gasPrice = gasPrice
    }
    if (gasLimit) {
      payload.gasLimit = gasLimit
    }
    if (ercStandard === 'erc1155') {
      const contract = new ethers.Contract(contractAddress, erc1155abi, signer)
      const hexAmount = new Decimal(amount).floor().toHexadecimal()
      const tx = await contract.safeTransferFrom(
        from,
        to,
        tokenId,
        hexAmount,
        '0x',
        payload
      )
      return tx.hash
    } else {
      const contract = new ethers.Contract(contractAddress, erc721abi, signer)
      const tx = await contract.transferFrom(from, to, tokenId, payload)
      return tx.hash
    }
  }

  estimateNftGas = async (
    ercStandard: NFTContractType,
    contractAddress: string,
    from: string,
    to: string,
    tokenId: string,
    amount: number
  ) => {
    const signer = this.wallet.connect(this.provider)
    if (ercStandard === 'erc1155') {
      const contract = new ethers.Contract(contractAddress, erc1155abi, signer)
      const hexAmount = new Decimal(amount).floor().toHexadecimal()
      const gasLimit = await contract.estimateGas.safeTransferFrom(
        from,
        to,
        tokenId,
        hexAmount,
        '0x'
      )
      return Number(gasLimit) * 2
    } else {
      const contract = new ethers.Contract(contractAddress, erc721abi, signer)
      const gasLimit = await contract.estimateGas.transferFrom(
        from,
        to,
        tokenId
      )
      return Number(gasLimit) * 2
    }
  }

  sendTransactionWrapper = async (p: TransactionParams): Promise<string> => {
    return (await this.sendTransaction(p, p.from)) as string
  }

  getAccountsWrapper = async (): Promise<string[]> => {
    return this.getAddress()
  }

  getEthSignWrapper = async (p: MessageParams): Promise<string> => {
    return await this.sign(p.from, p.data)
  }

  getEncryptionPublicKeyWrapper = async (from: string): Promise<string> => {
    return this.getPublicKey(from)
  }

  signTransactionWrapper = async (p: TransactionParams): Promise<string> => {
    return await this.signTransaction(p, p.from)
  }

  personalSignWrapper = async (p: MessageParams): Promise<string> => {
    return await this.personalSign(p.from, p.data)
  }

  decryptWrapper = async (p: MessageParams): Promise<string> => {
    return this.decrypt(p.data, p.from)
  }

  signTypedMessageV4Wrapper = async (
    p: TypedMessageParams
  ): Promise<string> => {
    return this.signTypedMessage(p.data, p.from)
  }

  getAccount(): { address: string; publicKey: string } {
    const { address, publicKey } = this.wallet
    return { address, publicKey }
  }

  getAddress(): string[] {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return [rpcStore.useGasless ? scwInstance.scwAddress : this.wallet.address]
  }

  getPrivateKey(): string {
    return '0x' + userStore.privateKey
  }

  getAccountType(): 'scw' | 'eoa' {
    return rpcStore.useGasless ? 'scw' : 'eoa'
  }

  private getWallet(address: string): ethers.Wallet | undefined {
    address = rpcStore.useGasless ? this.wallet.address : address
    if (this.wallet.address.toUpperCase() === address.toUpperCase()) {
      return this.wallet
    }
    return undefined
  }

  async getChainId() {
    if (this.provider.network) return this.provider.network.chainId
    return (await this.provider.detectNetwork()).chainId
  }

  private getPublicKey(address: string): string {
    const wallet = this.getWallet(address)
    if (wallet) {
      return this.wallet.publicKey
    } else {
      throw new Error('No Wallet found for the provided address')
    }
  }

  private async sign(address: string, msg: string): Promise<string> {
    const wallet = this.getWallet(address)
    if (wallet) {
      const signature = ecsign(
        setLengthLeft(Buffer.from(stripHexPrefix(msg), 'hex'), 32),
        Buffer.from(stripHexPrefix(wallet.privateKey), 'hex')
      )
      const rawMessageSig = concatSig(
        signature.v as unknown as Buffer,
        signature.r,
        signature.s
      )
      return rawMessageSig
    } else {
      throw new Error(errors.WALLET.NOT_FOUND)
    }
  }

  private async personalSign(address: string, msg: string) {
    const msgToSign = isHexString(msg)
      ? addHexPrefix(msg)
      : addHexPrefix(Buffer.from(msg).toString('hex'))
    const wallet = this.getWallet(address)
    if (wallet) {
      const signature = personalSign(
        Buffer.from(stripHexPrefix(wallet.privateKey), 'hex'),
        { data: msgToSign }
      )
      return signature
    } else {
      throw new Error(errors.WALLET.NOT_FOUND)
    }
  }

  public async sendTransaction(data, address: string): Promise<string> {
    if (rpcStore.useGasless) {
      const txParams = {
        from: address,
        to: data.to,
        value: data.value,
      }
      const transactionMode = await this.determineScwMode()
      const tx = await scwInstance.doTx(
        txParams,
        this.getParamsForDoTx(transactionMode)
      )
      gaslessStore.canUseWalletBalance = null
      const txDetails = await tx.wait()
      return txDetails.receipt.transactionHash
    } else {
      const wallet = this.getWallet(address)
      if (wallet) {
        const signer = wallet.connect(this.provider)
        const tx = await signer.sendTransaction(data)
        return tx.hash
      } else {
        throw new Error(errors.WALLET.NOT_FOUND)
      }
    }
  }

  private async decrypt(ciphertext: string, address: string) {
    const wallet = this.getWallet(address)
    if (wallet) {
      const parsedCipher = cipher.parse(ciphertext)
      const decryptedMessage = await decryptWithPrivateKey(
        wallet.privateKey,
        parsedCipher
      )
      return decryptedMessage
    } else {
      throw new Error(errors.WALLET.NOT_FOUND)
    }
  }

  private async signTransaction(txData, address: string) {
    const wallet = this.getWallet(address)
    if (wallet) {
      txData.from = this.wallet.address
      return await wallet.signTransaction({ ...txData })
    } else {
      throw new Error(errors.WALLET.NOT_FOUND)
    }
  }

  private async signTypedMessage(data, address: string) {
    const wallet = this.getWallet(address)
    if (wallet) {
      const parsedData = JSON.parse(data)
      const signature = signTypedDataV4(
        Buffer.from(stripHexPrefix(wallet.privateKey), 'hex'),
        { data: parsedData }
      )
      return signature
    } else {
      throw new Error('No Wallet found for the provided address')
    }
  }

  getTransaction(txHash: string | Uint8Array): Promise<TransactionResponse> {
    return this.provider.getTransaction(this.coerceAmbiguousToString(txHash))
  }

  private coerceAmbiguousToString(x: string | Uint8Array) {
    let y: string
    if (x instanceof Uint8Array) {
      y = ethers.utils.hexlify(x)
    } else {
      // noinspection JSSuspiciousNameCombination
      y = x
    }
    return y
  }

  getTokenBalance(
    _contractAddr: string | Uint8Array,
    walletAddress: string | Uint8Array
  ): Promise<ethers.BigNumberish> {
    const contractAddr = this.coerceAmbiguousToString(_contractAddr)

    const ethersContract = new ethers.Contract(
      contractAddr,
      erc20abi,
      this.provider
    )

    return ethersContract.balanceOf(walletAddress)
  }

  getTokenDecimals(_contractAddress: string | Uint8Array): Promise<number> {
    const contractAddr = this.coerceAmbiguousToString(_contractAddress)
    const ethersContract = new ethers.Contract(
      contractAddr,
      erc20abi,
      this.provider
    )

    return ethersContract.decimals()
  }

  getTokenSymbol(_contractAddress: string | Uint8Array): Promise<string> {
    const contractAddr = this.coerceAmbiguousToString(_contractAddress)
    const ethersContract = new ethers.Contract(
      contractAddr,
      erc20abi,
      this.provider
    )

    return ethersContract.symbol()
  }

  get chainType() {
    return ChainType.evm_secp256k1
  }

  public async cancelTransaction(txHash: string) {
    try {
      const transaction = (await this.provider.getTransaction(
        txHash
      )) as TransactionResponse
      const payload = {
        nonce: transaction.nonce,
        to: transaction.to,
        from: transaction.from,
        value: 0,
      }
      return await this.sendTransactionWrapper(payload)
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

export { EVMAccountHandler }

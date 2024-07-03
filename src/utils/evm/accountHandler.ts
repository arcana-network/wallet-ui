import {
  concatSig,
  personalSign,
  signTypedData,
  SignTypedDataVersion,
} from '@metamask/eth-sig-util'
import { Decimal } from 'decimal.js'
import { cipher, decryptWithPrivateKey } from 'eth-crypto'
import {
  addHexPrefix,
  ecsign,
  isHexString,
  setLengthLeft,
  stripHexPrefix,
} from 'ethereumjs-util'
import {
  isHex,
  PrivateKeyAccount,
  PublicClient,
  createPublicClient,
  http,
  parseAbi,
  getContract,
  getAddress,
  toHex,
  TransactionReceipt,
  createWalletClient,
  WalletClient,
  encodeFunctionData,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { ERC1155 } from '@/abis/erc1155.abi'
// import { ERC20 } from '@/abis/erc20.abi'
import { ERC721 } from '@/abis/erc721.abi'
import { NFTContractType } from '@/models/NFT'
import { useAppStore } from '@/store/app'
import { useGaslessStore } from '@/store/gasless'
import { useModalStore } from '@/store/modal'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { ChainType } from '@/utils/chainType'
import { errors } from '@/utils/content'
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
  client: PublicClient
  account: PrivateKeyAccount
  walletClient: WalletClient
  privateKey: string
  constructor(privateKey: string, rpcUrl: string) {
    this.client = createPublicClient({
      transport: http(rpcUrl),
    })
    this.privateKey = isHex(privateKey) ? privateKey : `0x${privateKey}`
    this.account = privateKeyToAccount(this.privateKey)
    this.walletClient = createWalletClient({
      transport: http(rpcUrl),
      account: this.account,
    })
  }

  get decimals() {
    return 18
  }

  get gasDecimals() {
    return 9
  }

  getBalance() {
    return this.client.getBalance(this.getAddress[0])
  }

  setProvider(url: string) {
    this.client = createPublicClient({
      transport: http(url),
    })
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

  getViewAccount() {
    return this.account
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

  async getNonceForArcanaSponsorship(address: string) {
    const contract = getContract({
      address: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
      abi: [
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
      client: this.client,
    })

    const nonce = await contract.read.getNonce([getAddress(address), BigInt(0)])
    return nonce.toString()
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
      const encodedData = encodeFunctionData({
        abi: parseAbi(abi),
        functionName: 'transfer',
        args: [recipientAddress, amount],
      })
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
      const contract = getContract({
        address: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
        abi: parseAbi(abi),
        client: this.client,
      })
      const payload = {} as any
      if (gasPrice) payload.gasPrice = gasPrice
      if (gasLimit) payload.gasLimit = gasLimit
      const hash = await contract.write.transfer(
        [recipientAddress, amount],
        payload
      )
      return hash
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
    const gas = await this.client.estimateContractGas({
      abi: parseAbi(abi),
      functionName: 'transfer',
      args: [recipientAddress, amount],
      address: this.account.address,
    })
    return Number(gas) * 2
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
    const payload = {} as any
    if (gasPrice) {
      payload.gasPrice = gasPrice
    }
    if (gasLimit) {
      payload.gasLimit = gasLimit
    }
    if (ercStandard === 'erc1155') {
      const contract = this.getERC1155Contract(getAddress(contractAddress))
      const hexAmount = BigInt(amount)
      const hash = await contract.write.safeTransferFrom(
        [getAddress(from), getAddress(to), BigInt(tokenId), hexAmount, '0x'],
        payload
      )
      return hash
    } else {
      const contract = this.getERC721Contract(getAddress(contractAddress))
      const hash = await contract.write.transferFrom(
        [getAddress(from), getAddress(to), BigInt(tokenId)],
        payload
      )
      return hash
    }
  }

  getERC721Contract = (contractAddress: `0x${string}`) => {
    const contract = getContract({
      address: getAddress(contractAddress),
      abi: ERC721,
      client: this.walletClient,
    })
    return contract
  }

  getERC1155Contract = (contractAddress: `0x${string}`) => {
    const contract = getContract({
      address: getAddress(contractAddress),
      abi: ERC1155,
      client: this.walletClient,
    })
    return contract
  }

  getERC20Contract = (contractAddress: `0x${string}`) => {
    const contract = getContract({
      address: getAddress(contractAddress),
      abi: ERC20ABI,
      client: this.walletClient,
    })
    return contract
  }

  estimateNftGas = async (
    ercStandard: NFTContractType,
    contractAddress: string,
    from: string,
    to: string,
    tokenId: string,
    amount: number
  ) => {
    if (ercStandard === 'erc1155') {
      const contract = this.getERC1155Contract(getAddress(contractAddress))
      const gasLimit = await contract.estimateGas.safeTransferFrom(
        [
          getAddress(from),
          getAddress(to),
          BigInt(tokenId),
          BigInt(amount),
          '0x',
        ],
        {}
      )
      return Number(gasLimit) * 2
    } else {
      const contract = this.getERC721Contract(getAddress(contractAddress))
      const gasLimit = await contract.estimateGas.transferFrom(
        [getAddress(from), getAddress(to), BigInt(tokenId)],
        {}
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
    throw new Error('eth_signTransaction is not available')
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
    const { address, publicKey } = this.account
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

  async getChainId() {
    const chainId = await this.client.getChainId()
    return chainId
  }

  private getPublicKey(address: string): string {
    return this.account.publicKey
  }

  private async sign(address: string, msg: string): Promise<string> {
    try {
      if (address == this.account.address) {
        const signature = ecsign(
          setLengthLeft(Buffer.from(stripHexPrefix(msg), 'hex'), 32),
          Buffer.from(stripHexPrefix(this.privateKey), 'hex')
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
    } catch (e) {
      return Promise.reject(e)
    }
  }

  private async personalSign(address: string, msg: string) {
    try {
      const msgToSign = isHexString(msg)
        ? addHexPrefix(msg)
        : addHexPrefix(Buffer.from(msg).toString('hex'))
      if (address == this.account.address) {
        const signature = await this.walletClient.signMessage({
          account: this.account,
          message: msgToSign,
        })
        return signature
      } else {
        throw new Error(errors.WALLET.NOT_FOUND)
      }
    } catch (e) {
      return Promise.reject(e)
    }
  }

  public async sendTransaction(data, address: string): Promise<string> {
    try {
      if (rpcStore.useGasless) {
        const txParams = {
          from: address,
          to: data.to,
          value: data.value,
        }
        const nonce = await this.getNonceForArcanaSponsorship(address)
        const transactionMode = await this.determineScwMode(nonce)
        if (transactionMode === 'SCW') {
          modalStore.setShowModal(true)
          appStore.expandWallet = true
          gaslessStore.showUseWalletBalancePermission = true
          await new Promise((resolve, reject) => {
            const intervalId = setInterval(() => {
              if (gaslessStore.canUseWalletBalance !== null) {
                clearInterval(intervalId)
                if (gaslessStore.canUseWalletBalance) {
                  resolve(null)
                } else {
                  reject(new Error('Gastank balance too low'))
                }
                modalStore.setShowModal(false)
                gaslessStore.showUseWalletBalancePermission = false
              }
            }, 500)
          })
        }
        const tx = await scwInstance.doTx(
          txParams,
          this.getParamsForDoTx(transactionMode)
        )
        gaslessStore.canUseWalletBalance = null
        const txDetails = await tx.wait()
        return txDetails.receipt.transactionHash
      } else {
        if (address == this.account.address) {
          const hash = await this.walletClient.sendTransaction(data)
          return hash
        } else {
          throw new Error(errors.WALLET.NOT_FOUND)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  private async decrypt(ciphertext: string, address: string) {
    try {
      if (address == this.account.address) {
        const parsedCipher = cipher.parse(ciphertext)
        const decryptedMessage = await decryptWithPrivateKey(
          this.privateKey,
          parsedCipher
        )
        return decryptedMessage
      } else {
        throw new Error(errors.WALLET.NOT_FOUND)
      }
    } catch (e) {
      return Promise.reject(e)
    }
  }

  private async signTransaction(txData, address: string) {
    throw new Error('sign transaction is not available anymore')
  }

  private async signTypedMessage(data, address: string) {
    if (this.account.address == address) {
      const parsedData = JSON.parse(data)
      const signature = signTypedDataV4(
        Buffer.from(stripHexPrefix(this.privateKey), 'hex'),
        { data: parsedData }
      )
      return signature
    } else {
      throw new Error('No Wallet found for the provided address')
    }
  }

  getTransaction(txHash: string): Promise<TransactionReceipt> {
    const transaction = this.client.getTransactionReceipt({
      hash: toHex(txHash),
    })
    return transaction
  }

  private coerceAmbiguousToString(x: string | Uint8Array) {
    let y: string
    if (x instanceof Uint8Array) {
      y = toHex(x)
    } else {
      // noinspection JSSuspiciousNameCombination
      y = x
    }
    return y
  }

  getTokenBalance(
    _contractAddr: string | Uint8Array,
    walletAddress: string
  ): Promise<bigint> {
    const contractAddr = this.coerceAmbiguousToString(_contractAddr)

    const contract = this.getERC20Contract(getAddress(contractAddr))
    return contract.read.balanceOf([getAddress(walletAddress)])
  }

  getTokenDecimals(_contractAddress: string | Uint8Array): Promise<number> {
    const contractAddr = this.coerceAmbiguousToString(_contractAddress)
    const contract = this.getERC20Contract(getAddress(contractAddr))
    return contract.read.decimals()
  }

  getTokenSymbol(_contractAddress: string | Uint8Array): Promise<string> {
    const contractAddr = this.coerceAmbiguousToString(_contractAddress)
    const contract = this.getERC20Contract(getAddress(contractAddr))
    return contract.read.symbol()
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

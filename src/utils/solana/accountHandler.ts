import type { RpcConfig } from '@arcana/auth'
import { BigNumber } from '@ethersproject/bignumber'
import {
  mplTokenMetadata,
  fetchAllDigitalAssetByOwner,
  fetchJsonMetadata,
  JsonMetadata,
} from '@metaplex-foundation/mpl-token-metadata'
import { PublicKey as PublicKeyUmi } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { signAsync as ed25519Sign } from '@noble/ed25519'
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} from '@solana/spl-token'
import {
  Commitment,
  Connection,
  Keypair,
  VersionedMessage,
  VersionedTransaction,
  GetProgramAccountsFilter,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from '@solana/web3.js'
import bs58 from 'bs58'
import Decimal from 'decimal.js'

import { Asset } from '@/models/Asset'
import { NFT } from '@/models/NFT'
import { ChainType } from '@/utils/chainType'
import { sleep } from '@/utils/sleep'
import { SPLTokenRegistry } from '@/utils/solana/splTokenRegistry'

type SendTokenProps = {
  to: string
  amount: string
  decimals: number
  mint: string
}

export class SolanaAccountHandler {
  // conn and rpcConfig can be change
  private conn: Connection
  private rpcConfig!: RpcConfig
  private splRegistry!: SPLTokenRegistry

  // Not a hash, nor is it 20 bytes, it's the whole public key encoded with Base58
  private readonly address: string
  private readonly kp: Keypair
  private splTokens: Asset[] = []
  private mplNFTs: NFT[] = []

  constructor(privateKey: Uint8Array, rpcUrl: string) {
    this.conn = new Connection(rpcUrl, {
      disableRetryOnRateLimit: true,
      commitment: 'confirmed',
    })
    this.kp = Keypair.fromSecretKey(<Uint8Array>privateKey)
    this.address = this.kp.publicKey.toBase58()
  }

  // unfortunately all the APIs desire a stupid base58-encoded string
  private coerceAmbiguousToString(x: string | Uint8Array) {
    let y: string
    if (x instanceof Uint8Array) {
      y = bs58.encode(x)
    } else {
      // noinspection JSSuspiciousNameCombination
      y = x
    }
    return y
  }

  private getKPForAddr() {
    return this.kp.secretKey.slice(0, 32)
  }

  get publicKey() {
    return this.kp.publicKey
  }

  get decimals() {
    return 9
  }

  get gasDecimals() {
    return 1
  }

  async getBalance(): Promise<BigNumber> {
    const lamports = await this.conn.getBalance(this.kp.publicKey)
    return BigNumber.from(lamports)
  }

  async setProvider(str): Promise<void> {
    this.conn = new Connection(str, {
      disableRetryOnRateLimit: true,
      commitment: 'confirmed',
    })
  }

  async sendTransaction(data: Uint8Array): Promise<string> {
    const deserialized = VersionedTransaction.deserialize(data)
    return this.conn.sendTransaction(deserialized)
  }

  async signTransaction(data: Uint8Array): Promise<Uint8Array> {
    const deserialized = VersionedTransaction.deserialize(data)
    deserialized.sign([this.kp])
    return deserialized.serialize()
  }

  async signAndSendTransaction(data: Uint8Array): Promise<string> {
    const txActual = VersionedTransaction.deserialize(data)
    txActual.sign([this.kp])
    return await this.conn.sendTransaction(txActual)
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    const k = this.getKPForAddr()
    return ed25519Sign(message, k)
  }

  getAccounts(): Promise<string[]> {
    return Promise.resolve([this.address])
  }

  getEncryptionPublicKeyWrapper(from: string): Promise<string> {
    if (from != this.address) {
      /// ???
      throw new Error('???')
    }
    return Promise.resolve(this.address)
  }

  getAccount() {
    return {
      address: this.address,
      publicKey: this.address,
    }
  }

  setRpcConfig(rc: RpcConfig): Promise<void> {
    this.rpcConfig = rc
    return this.setProvider(rc.rpcUrls[0])
  }
  getChainId() {
    return this.rpcConfig.chainId
  }

  getTransaction(tHash: string | Uint8Array) {
    const h = this.coerceAmbiguousToString(tHash)
    return this.conn.getParsedTransaction(h, {
      commitment: 'finalized',
      maxSupportedTransactionVersion: 0,
    })
  }

  async getFee(
    message: VersionedMessage,
    commitment: Commitment = 'finalized'
  ) {
    return await this.conn.getFeeForMessage(message, commitment)
  }

  async getLatestBlockHash() {
    return this.conn.getLatestBlockhash().then((res) => res.blockhash)
  }

  async sendCustomToken(props: SendTokenProps) {
    const sourceAccount = await getOrCreateAssociatedTokenAccount(
      this.conn,
      this.kp,
      new PublicKey(props.mint),
      this.kp.publicKey
    )
    const destinationAccount = await getOrCreateAssociatedTokenAccount(
      this.conn,
      this.kp,
      new PublicKey(props.mint),
      new PublicKey(props.to)
    )
    const tx = new Transaction()
    tx.add(
      createTransferInstruction(
        sourceAccount.address,
        destinationAccount.address,
        this.kp.publicKey,
        BigInt(
          new Decimal(props.amount)
            .mul(Decimal.pow(10, props.decimals))
            .floor()
            .toNumber()
        )
      )
    )
    const latestBlockHash = await this.conn.getLatestBlockhash('confirmed')
    tx.recentBlockhash = await latestBlockHash.blockhash
    const signature = await sendAndConfirmTransaction(this.conn, tx, [this.kp])
    return signature
  }

  async getAllUserNFTs(): Promise<NFT[]> {
    await sleep(200)
    const umi = createUmi(this.conn.rpcEndpoint).use(mplTokenMetadata())
    const assets = await fetchAllDigitalAssetByOwner(
      umi,
      this.kp.publicKey as unknown as PublicKeyUmi
    )
    const nfts: NFT[] = []
    if (assets?.length) {
      for (const asset of assets) {
        const collectionAddress =
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          asset.metadata.collection?.value?.key ?? 'Unknown'
        const uri = asset.metadata.uri
        asset.edition?.publicKey
        let tokenDetails: JsonMetadata | null = null
        const attributes: any[] = []
        if (uri) {
          tokenDetails = await fetchJsonMetadata(umi, uri)
          if (tokenDetails?.attributes?.length) {
            tokenDetails.attributes.forEach((attr: any) => {
              attributes.push({
                trait_type: attr.trait_type ?? attr.trait,
                value: attr.value,
              })
            })
          }
        }
        nfts.push({
          type: 'mpl',
          address: collectionAddress,
          tokenId: asset.metadata.mint,
          collectionName: `${asset.metadata.symbol}`,
          name: asset.metadata.name,
          description: tokenDetails?.description,
          imageUrl: tokenDetails?.image,
          animationUrl: tokenDetails?.animation_url,
          attributes,
          tokenUrl: uri,
          autodetected: false,
          balance: 1,
        })
      }
    }
    this.mplNFTs = [...nfts]
    return nfts
  }

  async getAllUserSPLTokens() {
    if (!this.splRegistry) {
      this.splRegistry = await SPLTokenRegistry.create()
    }
    await sleep(200)
    const filters: GetProgramAccountsFilter[] = [
      {
        dataSize: 165, //size of account (bytes)
      },
      {
        memcmp: {
          offset: 32,
          bytes: this.address,
        },
      },
    ]
    const programTokens = await this.conn.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID, //SPL Token Program, new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
      { filters: filters }
    )
    const programTokens2022 = await this.conn.getParsedProgramAccounts(
      TOKEN_2022_PROGRAM_ID,
      { filters: filters }
    )
    const accounts = [...programTokens, ...programTokens2022]
    const ownedSplTokens = [] as Asset[]
    accounts.forEach((account) => {
      //Parse the account data
      const parsedAccountInfo: any = account.account.data
      const mintAddress: string = parsedAccountInfo['parsed']['info']['mint']
      const tokenBalance: number =
        parsedAccountInfo['parsed']['info']['tokenAmount']['uiAmount']
      const tokenDetails = this.splRegistry.get(mintAddress)
      if (tokenDetails)
        ownedSplTokens.push({
          address: tokenDetails?.address || mintAddress,
          symbol: tokenDetails?.symbol || 'Unknown',
          decimals: tokenDetails?.decimals || 0,
          name: tokenDetails?.name || 'Unknown',
          balance: tokenBalance,
          logo: tokenDetails?.logoURI,
          image: tokenDetails?.logoURI,
        })
    })
    this.splTokens = [...ownedSplTokens]
    return ownedSplTokens
  }

  get storedTokens() {
    return this.splTokens
  }

  get storedNFTs() {
    return this.mplNFTs
  }

  get chainType() {
    return ChainType.solana_cv25519
  }
}

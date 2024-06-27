import type { RpcConfig } from '@arcana/auth'

interface RpcConfigWallet extends RpcConfig {
  favicon: string
  isCustom: boolean
  chainType?: string
  compatibility?: string
}

export type { RpcConfigWallet }

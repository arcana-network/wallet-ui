type Network = 'dev' | 'testnet'

type UXMode = 'popup' | 'redirect'

type InitParams = {
  appId: string
  redirectUri: string
  network: Network
  uxMode: UXMode
  debug: boolean
}

export type { InitParams }

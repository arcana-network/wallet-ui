import { ethers } from 'ethers'

import { produceProviderFromURLString } from '@/utils/evm/rpcURLToProvider'

export const getWalletType = async (
  appId,
  rpcUrl = process.env.VUE_APP_WALLET_RPC_URL
) => {
  const appAddress = appId
  if (!appAddress) {
    return null
  }
  const provider = produceProviderFromURLString(rpcUrl)
  const contract = new ethers.Contract(
    appAddress,
    ['function walletType() view returns (uint)'],
    provider
  )
  try {
    const res = await contract.functions.walletType()
    return res[0].toNumber()
  } catch (e) {
    return null
  } finally {
    await provider.destroy()
  }
}

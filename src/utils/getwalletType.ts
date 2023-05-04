import { ethers } from 'ethers'

const getContract = (rpcUrl, appAddress) => {
  const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl)
  return new ethers.Contract(
    appAddress,
    ['function walletType() view returns (uint)'],
    provider
  )
}

export const getWalletType = async (
  appId,
  rpcUrl = process.env.VUE_APP_WALLET_RPC_URL
) => {
  const appAddress = appId
  if (!appAddress) {
    return null
  }
  const contract = getContract(rpcUrl, appAddress)
  try {
    const res = await contract.functions.walletType()
    return res[0].toNumber()
  } catch (e) {
    return null
  }
}

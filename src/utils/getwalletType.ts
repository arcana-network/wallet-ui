import { ethers } from 'ethers'

const getContract = (rpcUrl, appAddress) => {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  return new ethers.Contract(
    appAddress,
    ['function walletType() view returns (uint)'],
    provider
  )
}

const getAppAddress = async (id) => {
  const addressResponse = await fetch(
    `${import.meta.env.VITE_WALLET_GATEWAY}/get-address/?id=${id}`
  )
  return (await addressResponse.json()).address
}

export const getWalletType = async (
  appId,
  rpcUrl = import.meta.env.VITE_WALLET_RPC_URL
) => {
  const appAddress = await getAppAddress(appId)
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

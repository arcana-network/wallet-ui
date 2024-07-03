import { createPublicClient, http, parseAbi } from 'viem'

export const getWalletType = async (
  appId,
  rpcUrl = process.env.VUE_APP_WALLET_RPC_URL
) => {
  const appAddress = appId
  if (!appAddress) {
    return null
  }
  const client = createPublicClient({
    transport: http(rpcUrl),
  })

  try {
    const walletType = await client.readContract({
      address: appAddress,
      abi: parseAbi(['function walletType() view returns (uint)']),
      functionName: 'walletType',
    })
    return Number(walletType)
  } catch (e) {
    return null
  }
}

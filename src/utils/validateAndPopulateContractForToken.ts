import contractMap from '@/contract-map.json'
import type { AssetContract, EthAssetContract } from '@/models/Asset'
import { getTokenSymbolAndDecimals } from '@/utils/contractUtil'
import { getStorage } from '@/utils/storageWrapper'

const ethMainnetTokens: EthAssetContract[] = Object.keys(contractMap).map(
  (address) => ({
    ...contractMap[address],
    address,
  })
)

function isContractInLocalStorage(walletAddress, chainId, tokenContract) {
  const assetContractsString = getStorage().local.getItem(
    `${walletAddress}/${chainId}/asset-contracts`
  )
  if (assetContractsString === null) return false

  const assetContracts = JSON.parse(assetContractsString) as AssetContract[]
  if (!Array.isArray(assetContracts)) return false

  return assetContracts.find(
    (contract) => contract.address === tokenContract.address
  )
}

function doesTokenBelongsToEthMainnet(isEthereumMainnet, tokenContract) {
  return (
    !isEthereumMainnet &&
    ethMainnetTokens.find(
      (contract) => contract.address === tokenContract.address
    )
  )
}

async function validateAndPopulateContractForToken({
  walletAddress,
  chainId,
  tokenContract,
  isEthereumMainnet,
}) {
  const result: {
    isValid: boolean
    error: unknown
    tokenContract: AssetContract
  } = {
    isValid: false,
    error: null,
    tokenContract: tokenContract,
  }
  if (!tokenContract.address) {
    result.isValid = false
    result.error = 'Required params missing'
    return result
  }
  if (isContractInLocalStorage(walletAddress, chainId, tokenContract)) {
    result.error = 'Token already added'
    result.isValid = false
    return result
  }
  if (doesTokenBelongsToEthMainnet(isEthereumMainnet, tokenContract)) {
    result.error = 'Token belongs to Ethereum Mainnet'
    result.isValid = false
    return result
  }
  try {
    const { symbol, decimals } = await getTokenSymbolAndDecimals({
      contractAddress: tokenContract.address,
    })
    result.tokenContract.symbol = result.tokenContract.symbol || symbol
    result.tokenContract.decimals =
      result.tokenContract.decimals || decimals || 0
    result.isValid = true
    result.error = null
    return result
  } catch (e) {
    result.error = 'Invalid contract address'
    result.isValid = false
    return result
  }
}

export default validateAndPopulateContractForToken

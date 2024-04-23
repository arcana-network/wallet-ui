import contractMap from '@/contract-map.json'
import type { AssetContract, EthAssetContract } from '@/models/Asset'
import { errors } from '@/utils/content'
import { getTokenSymbolAndDecimals } from '@/utils/contractUtil'
import { getStorage } from '@/utils/storageWrapper'

const ethMainnetTokens: EthAssetContract[] = Object.keys(contractMap).map(
  (address) => ({
    ...contractMap[address],
    address,
  })
)

function isContractInLocalStorage(walletAddress, chainId, tokenContract) {
  const assetContracts = getStorage().local.getAssetContractList(
    walletAddress,
    chainId
  )

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
    result.error = errors.VALIDATE_TOKEN.PARAMS_MISSING
    return result
  }
  if (isContractInLocalStorage(walletAddress, chainId, tokenContract)) {
    result.error = errors.VALIDATE_TOKEN.ALREADY_ADDED
    result.isValid = false
    return result
  }
  if (doesTokenBelongsToEthMainnet(isEthereumMainnet, tokenContract)) {
    result.error = errors.VALIDATE_TOKEN.BELONGS_ETH
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
    result.error = errors.VALIDATE_TOKEN.INVALID_CONTRACT
    result.isValid = false
    return result
  }
}

export default validateAndPopulateContractForToken

import contractMap from '@/contract-map.json'
import { EthAssetContract } from '@/models/Asset'
import type { NFT } from '@/models/NFT'
import { getNFTDetails, modifyIpfsUrl } from '@/services/getNFTDetails.service'
import { NFTDB } from '@/services/nft.service'
import {
  checkOwnership,
  getCollectionName,
  getTokenUri,
} from '@/utils/nftUtils'
import { getStorage } from '@/utils/storageWrapper'

const ethMainnetTokens: EthAssetContract[] = Object.keys(contractMap).map(
  (address) => ({
    ...contractMap[address],
    address,
  })
)

function isNftInDB(nfts, tokenContract) {
  const tokenId = tokenContract.tokenId || tokenContract.token_id

  return nfts.find(
    (nft) => nft.address === tokenContract.address && nft.tokenId === tokenId
  )
}

function doesNftBelongsToEthMainnet(isEthereumMainnet, tokenContract) {
  return (
    !isEthereumMainnet &&
    ethMainnetTokens.find(
      (contract) => contract.address === tokenContract.address
    )
  )
}

async function validateAndPopulateContractForNft({
  walletAddress,
  chainId,
  nftContract,
  isEthereumMainnet,
}) {
  const result: {
    isValid: boolean
    error: unknown
    nft: NFT
  } = {
    isValid: false,
    error: null,
    nft: nftContract,
  }
  const tokenId = nftContract.tokenId
  if (!nftContract.address || !tokenId) {
    result.isValid = false
    result.error = 'Required params missing'
    return result
  }
  const nftDB = await NFTDB.create(getStorage().local, walletAddress, true)
  const nfts = nftDB.getNFTs(Number(chainId))

  if (isNftInDB(nfts, nftContract)) {
    result.error = 'Token already added'
    result.isValid = false
    return result
  }
  if (doesNftBelongsToEthMainnet(isEthereumMainnet, nftContract)) {
    result.error = 'Token belongs to Ethereum Mainnet'
    result.isValid = false
    return result
  }
  try {
    const name = await getCollectionName(nftContract.address)
    result.nft.collectionName = name
    result.error = null
  } catch (e) {
    result.error = 'Invalid contract address'
    result.isValid = false
    return result
  }

  try {
    const hasOwnership = await checkOwnership(nftContract.type, {
      contractAddress: nftContract.address,
      tokenId,
    })

    if (hasOwnership.owner) {
      result.nft.balance = hasOwnership.balance
    } else {
      result.error = "You don't own this NFT"
      result.isValid = false
      return result
    }
  } catch (e) {
    result.error = 'Invalid token ID'
    result.isValid = false
    return result
  }

  try {
    const tokenUri = await getTokenUri(nftContract.type, {
      contractAddress: nftContract.address,
      tokenId,
    })

    if (tokenUri) {
      try {
        const tokenDetails = await getNFTDetails(tokenUri, nftContract.tokenId)
        const imageUrl = tokenDetails.image_url || tokenDetails.image
        const sanitizedImageUrl = sanitizeUrl(imageUrl) as string
        const animationUrl =
          tokenDetails.animation_url || tokenDetails.animation
        const sanitizedAnimationUrl = sanitizeUrl(animationUrl)
        const attributes = tokenDetails.attributes?.length
          ? tokenDetails.attributes.map((attribute) => ({
              trait: attribute.trait_type || attribute.trait,
              value: attribute.value,
            }))
          : []

        result.nft.tokenId = tokenId
        result.nft.type = nftContract.type
        result.nft.address = nftContract.address
        result.nft.name = tokenDetails.name || `#${nftContract.tokenId}`
        result.nft.description = tokenDetails.description
        result.nft.imageUrl = sanitizedImageUrl
        result.nft.animationUrl = sanitizedAnimationUrl
        result.nft.attributes = attributes
        result.nft.tokenUrl = tokenUri
        result.isValid = true
        return result
      } catch (e) {
        result.error = "Couldn't fetch NFT details"
        result.isValid = false
        return result
      }
    } else {
      result.error = 'Invalid Token ID'
      result.isValid = false
      return result
    }
  } catch (e) {
    console.log(e)
    result.error = "You don't own this NFT"
    result.isValid = false
    return result
  }
}

function sanitizeUrl(url?: string) {
  if (url && url.includes('ipfs://')) {
    return modifyIpfsUrl(url)
  }
  return url
}

export default validateAndPopulateContractForNft

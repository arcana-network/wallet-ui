import axios from 'axios'

async function getNFTDetails(tokenUri: string, tokenId: string) {
  if (tokenUri.startsWith('data:application/json;base64,')) {
    const base64Data = tokenUri.replace('data:application/json;base64,', '')
    const data = window.atob(base64Data)
    return JSON.parse(data)
  }

  let url: string

  if (tokenUri.startsWith('ipfs://')) {
    url = modifyIpfsUrl(tokenUri)
  } else if (tokenUri.includes('opensea.io') && tokenUri.includes('0x{id}')) {
    url = modifyOpenseaUrl(tokenUri, tokenId)
  } else {
    url = tokenUri
  }

  try {
    return (await axios.get(url)).data
  } catch (e) {
    console.error(e)
    return null
  }
}

function modifyIpfsUrl(url: string) {
  if (url.startsWith('ipfs://ipfs/')) {
    return url.replace('ipfs://', 'https://ipfs.io/')
  }
  return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
}

function modifyOpenseaUrl(url: string, tokenId: string) {
  return url.replace('0x{id}', tokenId)
}

export { getNFTDetails, modifyIpfsUrl }

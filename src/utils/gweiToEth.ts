import { ethers } from 'ethers'

function convertGweiToEth(value) {
  const valueInWei = value * Math.pow(10, 9)
  return ethers.utils.formatEther(valueInWei)
}

export { convertGweiToEth }

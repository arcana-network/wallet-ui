import { ethers } from 'ethers'

function convertGweiToEth(value) {
  const valueInWei = `${(value * Math.pow(10, 9)).toFixed(0)}` // converting to string to prevent overflow - https://docs.ethers.io/v5/troubleshooting/errors/#help-NUMERIC_FAULT-overflow
  return ethers.utils.formatEther(valueInWei)
}

export { convertGweiToEth }

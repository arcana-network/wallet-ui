// Ethers doesn't export EthersError class/type
// it simply patches the Native Error object with Reason and Code

interface EthersError extends Error {
  reason?: string
  code?: string
}

export type { EthersError }

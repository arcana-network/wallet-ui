class PreviewData {
  senderWalletAddress: string
  recipientWalletAddress: string
  amount: string
  gasFee: string
  selectedToken: string
  estimatedGas: string
  constructor(
    senderWalletAddress,
    recipientWalletAddress,
    amount,
    gasFee,
    selectedToken,
    estimatedGas
  ) {
    this.senderWalletAddress = senderWalletAddress
    this.recipientWalletAddress = recipientWalletAddress
    this.amount = amount
    this.gasFee = gasFee
    this.selectedToken = selectedToken
    this.estimatedGas = estimatedGas
  }
}

export { PreviewData }

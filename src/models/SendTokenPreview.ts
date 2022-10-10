class PreviewData {
  senderWalletAddress: string
  recipientWalletAddress: string
  amount: string
  gasFee: string
  selectedToken: string
  constructor(
    senderWalletAddress,
    recipientWalletAddress,
    amount,
    gasFee,
    selectedToken
  ) {
    this.senderWalletAddress = senderWalletAddress
    this.recipientWalletAddress = recipientWalletAddress
    this.amount = amount
    this.gasFee = gasFee
    this.selectedToken = selectedToken
  }
}

export { PreviewData }

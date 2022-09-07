class PreviewData {
  senderWalletAddress: string
  recipientWalletAddress: string
  amount: string
  gasFee: string
  constructor(senderWalletAddress, recipientWalletAddress, amount, gasFee) {
    this.senderWalletAddress = senderWalletAddress
    this.recipientWalletAddress = recipientWalletAddress
    this.amount = amount
    this.gasFee = gasFee
  }
}

export { PreviewData }

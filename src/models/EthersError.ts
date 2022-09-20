class EthersError {
  error: { message: string }
  reason: string
  code: string
  constructor(message, reason, code) {
    this.error = { message }
    this.reason = reason
    this.code = code
  }
}

export { EthersError }

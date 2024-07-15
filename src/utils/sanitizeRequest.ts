function sanitizeRequest(request) {
  if (request.method === 'eth_sendTransaction') {
    return sanitizeSendTransactionRequest(request)
  }
  return { ...request }
}

function sanitizeSendTransactionRequest(request) {
  const params = { ...request.params[0] }
  const sanitizedParams: any = {
    to: params.to,
    from: params.from,
    value: params.value,
    data: params.data,
    gasLimit: Number(params.gas),
  }
  if (!params.type && params.gasPrice) {
    sanitizedParams.gasPrice = params.gasPrice
  }
  if ((params.type && Number(params.type) === 2) || !params.gasPrice) {
    sanitizedParams.maxFeePerGas = params.maxFeePerGas
    sanitizedParams.maxPriorityFeePerGas = params.maxPriorityFeePerGas
  }
  request.params = [{ ...sanitizedParams }]
  return { ...request }
}

export { sanitizeRequest }

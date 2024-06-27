import { TransactionRequest } from '@ethersproject/providers'

interface TransactionData extends TransactionRequest {
  from: string
}

function isStringArray(p: unknown): p is string[] {
  if (!Array.isArray(p)) {
    return false
  }

  for (const v of p) {
    if (typeof v !== 'string') {
      return false
    }
  }
  return true
}

function isTransationData(p: unknown): p is TransactionData {
  if (typeof p === 'object' && p !== null && 'from' in p) {
    return typeof (p as TransactionData).from === 'string'
  }
  return false
}

function isTransactionDataArray(p: unknown): p is TransactionData[] {
  if (!Array.isArray(p)) {
    return false
  }

  for (const v of p) {
    if (!isTransationData(v)) {
      return false
    }
  }
  return true
}

export { isTransactionDataArray, isStringArray }

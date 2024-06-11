import base58 from 'bs58'
import { stripHexPrefix, isHexString } from 'ethereumjs-util'

function isJson(str: string) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

function hex2a(hexx: string) {
  return Buffer.from(stripHexPrefix(hexx), 'hex').toString()
}

export const advancedInfo = (
  method: string,
  params: string | string[] | any
) => {
  let data
  if (method == 'eth_sign' && isJson(params[1])) {
    const jsonData = JSON.parse(params[1])
    if (jsonData.domain.name == 'Arcana Forwarder') {
      data = {
        'Meta-transaction request': {
          version: jsonData.domain.version,
          chainID: jsonData.domain.chainId,
          Forwarder_Address: jsonData.domain.verifyingContract,
        },
        'Message Info': {
          value: jsonData.message.value,
          gas: `${jsonData.message.gas} (will be paid by Arcana Forwarder)`,
          nonce: jsonData.message.nonce,
          from: jsonData.message.from,
          to: jsonData.message.to,
          data: jsonData.message.data,
        },
      }
    } else {
      data = params[1]
    }
  } else if (method == 'personal_sign') {
    data = isHexString(params[0]) ? hex2a(params[0]) : params[0]
  } else if (method == 'eth_signTypedData_v4' && isJson(params[1])) {
    const jsonData = JSON.parse(params[1])
    if (jsonData.domain.name == 'Arcana Forwarder') {
      data = {
        'Message Info': {
          ...jsonData.message,
        },
        'Meta-transaction request': {
          version: jsonData.domain.version,
          chainID: jsonData.domain.chainId,
          Forwarder_Address: jsonData.domain.verifyingContract,
        },
      }
    } else {
      data = params[1]
    }
  } else if (method == 'eth_decrypt') {
    data = {
      'Cipher text': params[0],
    }
  } else if (
    method === 'signTransaction' ||
    method === 'signAndSendTransaction' ||
    method === 'mvx_signMessage'
  ) {
    data = params.message
  } else if (method === 'signAllTransactions') {
    data = params.message
  } else if (['signMessage', 'near_signMessage'].includes(method)) {
    const bs58decoded = new TextDecoder().decode(
      base58.decode(params.message as unknown as string)
    )
    data = bs58decoded
  } else {
    data = params
  }

  return data
}

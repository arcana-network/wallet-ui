import { isHexString } from 'ethereumjs-util'

function isJson(str: string) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

function hex2a(hexx) {
  const hex = hexx.toString().replace('0x', '')
  let str = ''
  for (let i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
  return str
}

export const advancedInfo = (method: string, params: string | string[]) => {
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
  } else {
    data = params
  }

  return data
}

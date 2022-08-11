function isJson(str: string) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

export const advancedInfo = (method: string, params: string | string[]) => {
  let data
  if (method == 'eth_sign' && isJson(params[1])) {
    const jsonData = JSON.parse(params[1])
    if (jsonData.domain.name == 'Arcana Forwarder') {
      data = {
        'Account Address': params[0],
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
    data = {
      'Account Address': params[1],
      'Message to Sign': params[0],
    }
  } else if (method == 'eth_signTypedData_v4' && isJson(params[1])) {
    const jsonData = JSON.parse(params[1])
    if (jsonData.domain.name == 'Arcana Forwarder') {
      data = {
        'Account Address': params[0],
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
  } else if (method == 'eth_decrypt') {
    data = {
      'Account Address': params[1],
      'Cipher text': params[0],
    }
  } else {
    data = params
  }

  return data
}

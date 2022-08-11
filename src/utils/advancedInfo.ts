export const advancedInfo = (method: string, params: string | string[]) => {
  let data: string

  if (method == 'eth_sign') {
    const jsonData = JSON.parse(params[1])
    console.log(jsonData)
    if (jsonData.domain.name == 'Arcana Forwarder') {
      data = `
        ACCOUNT ADDRESS
        ${params[0]} \n
        SIG TYPE : META-TRANSACTION REQUEST
        version : ${jsonData.domain.version}
        chain-Id :  ${jsonData.domain.chainId}
        Forwarder contract Address : ${jsonData.domain.verifyingContract} \n
        MESSAGE INFORMATION
        value : ${jsonData.message.value}
        gas : ${jsonData.message.gas} (will be paid by Arcana Forwarder)
        nonce : ${jsonData.message.nonce}
        from : ${jsonData.message.from}
        to : ${jsonData.message.to}
        Data : ${jsonData.message.data}
      `
    } else {
      data = JSON.stringify(params[1])
    }
  } else if (method == 'personal_sign') {
    data = `
      ACCOUNT ADDRESS
      ${params[1]} \n
      MESSAGE TO SIGN
      ${params[0]}
    `
  } else if (method == 'eth_signTypedData_v4') {
    const jsonData = JSON.parse(params[1])
    if (jsonData.domain.name == 'Arcana Forwarder') {
      data = `
        ACCOUNT ADDRESS
        ${params[0]} \n
        SIG TYPE : META-TRANSACTION REQUEST
        version : ${jsonData.domain.version}
        chain-Id :  ${jsonData.domain.chainId}
        Forwarder contract Address : ${jsonData.domain.verifyingContract} \n
        MESSAGE INFORMATION
        value : ${jsonData.message.value}
        gas : ${jsonData.message.gas} (will be paid by Arcana Forwarder)
        nonce : ${jsonData.message.nonce}
        from : ${jsonData.message.from}
        to : ${jsonData.message.to}
        Data : ${jsonData.message.data}
      `
    } else {
      data = JSON.stringify(params[1])
    }
  } else if (method == 'eth_decrypt') {
    data = `
      ACCOUNT ADDRESS
      ${params[1]}
      Ciphertext to be decrypted
      ${params[0]}
    `
  } else {
    data = JSON.stringify(params)
  }

  return { '': data }
}

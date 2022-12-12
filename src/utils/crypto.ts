import EthCrypto from 'eth-crypto'

const getRandomPrivateKey = () => {
  const { privateKey, publicKey, address } = EthCrypto.createIdentity()
  return {
    publicKey,
    privateKey,
    address,
  }
}

const sign = (message: string, privateKey: string) => {
  const hash = EthCrypto.hash.keccak256(message)
  const signature = EthCrypto.sign(privateKey, hash)
  return signature
}

const encrypt = async (message: string, publicKey: string) => {
  const cipherObj = await EthCrypto.encryptWithPublicKey(publicKey, message)
  const ciphertext = EthCrypto.cipher.stringify(cipherObj)
  return ciphertext
}

const decrypt = async (ciphertext: string, privateKey: string) => {
  const cipherObj = EthCrypto.cipher.parse(ciphertext)
  const plaintext = EthCrypto.decryptWithPrivateKey(privateKey, cipherObj)
  return plaintext
}

export { getRandomPrivateKey, encrypt, decrypt, sign }

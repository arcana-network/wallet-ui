/**
 * @jest-environment node
 */

import { AccountHandler } from '@src/utils/accountHandler'
import {
  accountHandlerTestData,
  accountHandlerExpectedData,
  sampleMessages,
} from '@tests/utils.test/testData'

describe('AccountHandler tests', () => {
  const accountHandler = new AccountHandler(accountHandlerTestData.privateKey)
  test('returns expected account', async () => {
    const account = accountHandler.getAccounts()
    expect(account[0]).toBe(accountHandlerTestData.address)
  })

  test('returns expected public key', async () => {
    const pk = accountHandler.getPublicKey(accountHandlerTestData.address)
    expect(pk).toBe(accountHandlerTestData.publicKey)
  })

  test('returns expected eth_signature', async () => {
    const sig = await accountHandler.requestSign(
      accountHandlerTestData.address,
      sampleMessages.messageData
    )
    expect(sig).toBe(accountHandlerExpectedData.signedMessage)
  })
  test('returns expected personal_sign', async () => {
    const sig = await accountHandler.requestPersonalSign(
      accountHandlerTestData.address,
      sampleMessages.messageData
    )
    expect(sig).toBe(accountHandlerExpectedData.personalSign)
  })
  test('returns expected eth_sign_typed_v4', async () => {
    const sig = await accountHandler.requestSignTypedMessage(
      sampleMessages.signedMessageData,
      accountHandlerTestData.address
    )
    expect(sig).toBe(accountHandlerExpectedData.signedTypedMessage)
  })
  test('returns expected decrypt', async () => {
    const sig = await accountHandler.requestDecryption(
      sampleMessages.ciphertext,
      accountHandlerTestData.address
    )
    expect(sig).toBe(accountHandlerExpectedData.plaintext)
  })
})

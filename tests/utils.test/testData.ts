const accountHandlerTestData = {
  privateKey:
    '0xc2cdf0a8b0a83b35ace53f097b5e6e6a0a1f2d40535eff1cf434f52a43d59d8f',
  publicKey:
    '6fcc37ea5e9e09fec6c83e5fbd7a745e3eee81d16ebd861c9e66f55518c197984e9f113c07f875691df8afc1029496fc4cb9509b39dcd38f251a83359cc8b4f7',
  address: '0x0A069C9E060e1466138873f6C315E9AD37C0b706',
}

const accountHandlerExpectedData = {
  signedMessage:
    '0xc9a949d769494c144ce80976680cd2d0062d48872ac48d4093ac74e8cbf55c353b64baec732520a27879aef418526bf215ba628e0c198f346ca1a2474d0211aa1c',
  personalSign:
    '0x7af640ac97db71e4383ba565f967742f6df45544bf96d9d0f6387500056792b94cbdaf79f0d87434691a064debf676fde5d98bbcd525969821824a381eec105d1c',
  signedTypedMessage:
    '0x7c86b24efae6852cb5b41b2ae87c786b29d33356d0523cbaac1a1e901385b9367838c3d2674e65c234ede9eede1140c6225303be0a11ae862bad3156e5064fc41b',
}
const signedMessageData = JSON.stringify({
  domain: {
    chainId: 1,
    name: 'Ether Mail',
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    version: '1',
  },

  message: {
    contents: 'Hello, Bob!',
    attachedMoneyInEth: 4.2,
    from: {
      name: 'Cow',
      wallets: [
        '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
      ],
    },
    to: [
      {
        name: 'Bob',
        wallets: [
          '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
          '0xB0B0b0b0b0b0B000000000000000000000000000',
        ],
      },
    ],
  },
  primaryType: 'Mail',
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    Group: [
      { name: 'name', type: 'string' },
      { name: 'members', type: 'Person[]' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person[]' },
      { name: 'contents', type: 'string' },
    ],
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallets', type: 'address[]' },
    ],
  },
})

const sampleMessages = {
  signedMessageData,
  messageData: 'testing123',
}

export { accountHandlerTestData, sampleMessages, accountHandlerExpectedData }

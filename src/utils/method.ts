const evmMethodAndAction = {
  eth_sign: 'Sign Message (Deprecated)',
  personal_sign: 'Sign Message',
  eth_signTypedData_v4: 'Sign Message',
  eth_sendTransaction: 'Send Transaction',
  eth_signTransaction: 'Sign Transaction',
  eth_decrypt: 'Request Decryption',
  wallet_addEthereumChain: 'Add Chain',
  wallet_switchEthereumChain: 'Switch Chain',
  wallet_watchAsset: 'Add Token',
}

const solanaMethodAndAction = {
  signAndSendTransaction: 'Sign and Send Transaction',
  signTransaction: 'Sign Transaction',
  signMessage: 'Sign Message',
  signAllTransactions: 'Sign All Transactions',
}

const methodAndAction = {
  ...evmMethodAndAction,
  ...solanaMethodAndAction,
}

export { evmMethodAndAction, methodAndAction, solanaMethodAndAction }

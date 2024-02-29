const evmMethodAndAction = {
  eth_sign: 'Sign Message (Deprecated)',
  personal_sign: 'Sign Message',
  eth_signTypedData_v4: 'Sign Message',
  eth_sendTransaction: 'Send Transaction',
  eth_signTransaction: 'Sign Transaction',
  eth_decrypt: 'Request Decryption',
  wallet_addEthereumChain: 'Add Chain',
  wallet_switchEthereumChain: 'Switch Chain',
  _arcana_switchAccountType: 'Switch Account Type',
  wallet_watchAsset: 'Add Token',
  _arcana_privateKey: 'Export Private Key',
  _send_token: 'Send Token',
}

const solanaMethodAndAction = {
  signAndSendTransaction: 'Sign and Send Transaction',
  signTransaction: 'Sign Transaction',
  signMessage: 'Sign Message',
  signAllTransactions: 'Sign All Transactions',
}

const mvxMethodAndAction = {
  mvx_signTransaction: 'Sign Transaction',
  mvx_signTransactions: 'Sign Transactions',
  mvx_signMessage: 'Sign Message',
}

const methodAndAction = {
  ...evmMethodAndAction,
  ...solanaMethodAndAction,
  ...mvxMethodAndAction,
}

export {
  evmMethodAndAction,
  methodAndAction,
  solanaMethodAndAction,
  mvxMethodAndAction,
}

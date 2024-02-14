const content = {
  RPC: {
    INPUT_EXISTS: (rpcUrl: string) =>
      `RPC URL - ${rpcUrl} already exists, please use a different one.`,
  },
  CHAIN_ID: {
    INPUT_EXISTS: (chainId: string) =>
      `Chain ID - ${chainId} already exists, please use a different one.`,
  },
  NETWORK: {
    INPUT_EXISTS:
      'This network is currently selected, please choose a different one and try again.',
  },
  PIN: 'Enter the pin to continue.',
  WALLET: {
    COPY: 'Wallet address copied.',
    INVALID: 'Please enter a valid wallet address.',
  },
  RECOVERY: {
    ANSWER_ALL: 'Answer all the questions to recover the key.',
    QUESTIONS: 'Questions must be unique!',
  },
  GAS: {
    PROVIDE: 'Please provide Gas Fee.',
    INSUFFICIENT: 'Insufficient balance to pay for the gas fee.',
    ESTIMATE: 'Cannot estimate gas fee. Please try again later.',
  },
  DETAILS: 'Enter all the details to continue.',
  TOKEN: {
    ADDED: 'Token Added successfully.',
    EXISTS: 'Token already added.',
    ETH_MAINNET: 'Token belongs to Ethereum Mainnet.',
    SENT: 'Token sent successfully.',
      INSUFFICIENT: 'Insufficient balance for transfer.',
    AMOUNT: 'Amount cannot be greater than the maximum available balance.',
  },
  NFT: {
    ADD: 'NFT Added.',
    ADDED: 'NFT already added.',
    UNSUPPORTED: 'Unsupported NFT.',
    OWNERSHIP: "You don't have ownership for this NFT.",
    DELETED: 'NFT Deleted.',
    NO_NFT_QUATITY: (quantity: number, balance: number | undefined) =>
      `You don't own enough NFTs to send ${quantity} NFTs. You can send ${balance} NFTs at most.`,
  },
  CONTRACT: {
    INVALID: 'Invalid contract address.',
  },
  MFA: {
    SETUP: 'MFA setup completed.',
    INCORRECT_ANSWERS: 'Incorrect answers.',
    INCORRECT_PIN: 'Incorrect pin.',
    QUESTIONNAIRE: 'Please fill in all the questionnaires.',
    QUESTIONS_REPEAT: 'Questions cannot be repeated.',
    QUESTIONS_REPEAT: 'Questions cannot be empty.',
    CANCELLED: 'User cancelled the setup.',
  },
}
const errors = {
  RPC: {
    ERROR: 'Incorrect combination of chain Id and RPC URL.',
    INVALID: 'Invalid RPC URL!',
  },
  COPY: 'Failed to copy.',
  WALLET: {
    COPY: 'Failed to copy wallet address.',
  },
  TOKEN: {
    INVALID: 'Invalid token Id',
  },
  MFA: {
    ERROR: 'Error occured while setting up MFA. Please try again!',
  },
  GENERIC: {
    QUANTITY: 'Please enter a valid quantity.',
    REQUEST: 'Please make the request again.',
    WRONG: 'Something went wrong, please try again.',
    VALUE: 'Please fill all values!',
  },
}
export { errors, content }

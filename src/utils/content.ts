const content = {
  RPC: {
    INPUT_EXISTS: (rpcUrl: string) =>
      `W-101: RPC URL - ${rpcUrl} already exists, please use a different one.`,
  },
  CHAIN_ID: {
    INPUT_EXISTS: (chainId: string) =>
      `W-102: Chain ID - ${chainId} already exists, please use a different one.`,
  },
  NETWORK: {
    INPUT_EXISTS:
      'W-103: This network is currently active. Select a different to make it active.',
  },
  PIN: 'W-104: Enter the pin to continue.',
  WALLET: {
    COPY: 'Wallet address copied.',
    INVALID: 'W-105: Please enter a valid wallet address.',
  },
  RECOVERY: {
    ANSWER_ALL: 'Answer all the questions to recover the key.',
    QUESTIONS: 'Questions must be unique!',
  },
  GAS: {
    PROVIDE: 'W-106: Please provide the Gas Fee.',
    INSUFFICIENT: 'W-107: Insufficient balance to pay for the gas fee.',
    ESTIMATE: 'W-108: Cannot estimate gas fee. Please try again later.',
    GREATER_LIMIT_MVX:
      'W-109: Gas limit cannot be set to a value less than the required gas fee for this transaction.',
  },
  DETAILS: 'W-110: Enter all the details to continue.',
  TOKEN: {
    ADDED: 'Token Added successfully.',
    EXISTS: 'Token already added.',
    ETH_MAINNET: 'Token belongs to Ethereum Mainnet.',
    SENT: 'Token sent successfully.',
    INSUFFICIENT: 'W-111:  Insufficient balance for specified transfer amount.',
    AMOUNT:
      'W-112: Amount cannot be greater than the maximum available balance.',
  },
  NFT: {
    ADD: 'NFT Added.',
    ADDED: 'NFT already added.',
    UNSUPPORTED: 'W-112: Unsupported NFT.',
    OWNERSHIP: "W-113: You don't have ownership for this NFT.",
    DELETED: 'NFT Deleted.',
    NO_NFT_QUANTITY: (quantity: number, balance: number | undefined) =>
      `W-114: Insufficient NFTs. At most, you can send ${balance} NFTs.`,
    CREATE_ERROR: 'W-116: Error creating NFT. Please try again.',
  },
  CONTRACT: {
    INVALID: 'W-115: Invalid contract address.',
  },
  MFA: {
    SETUP: 'MFA setup completed.',
    INCORRECT_ANSWERS: 'W-116: Incorrect answers.',
    INCORRECT_PIN: 'W-117: Incorrect pin.',
    QUESTIONNAIRE: 'W-118: Please fill in all the questionnaires.',
    QUESTIONS_REPEAT: 'W-119: Questions cannot be repeated.',
    QUESTIONS_EMPTY: 'W-120: Questions cannot be empty.',
    CANCELLED: 'W-121: User cancelled the setup.',
  },
}
const errors = {
  RPC: {
    ERROR: 'W-122: Incorrect combination of chain Id and RPC URL.',
    INVALID: 'W-123: Invalid RPC URL!',
  },
  COPY: 'W-124: Failed to copy.',
  WALLET: {
    COPY: 'W-125: Failed to copy wallet address.',
    BALANCE: 'W-126: Failed to get balance.',
    NOT_FOUND: 'W-148: No valid wallet is associated for the given address.',
  },
  TOKEN: {
    INVALID: 'W-127: Invalid token Id',
  },
  MFA: {
    ERROR: 'W-128: Error occurred while setting up MFA. Please try again!',
  },
  GENERIC: {
    QUANTITY: 'W-129: Please enter a valid quantity.',
    REQUEST: 'W-130: Please make the request again.',
    WRONG: 'W-131: Something went wrong, please try again.',
    VALUE: 'W-132: Please fill all values!',
  },
  TRANSAK: {
    FAILED_INITIALIZATION: 'W-133: Failed to initialize one or more on-ramps.',
  },
  LOGIN_TOKEN: {
    FAILED: 'W-134: Could not get token',
  },
  SCW: {
    INIT: 'W-135: Failed to initialize SCW.',
  },
  ACTIVITIES: {
    FAILED: 'W-136: Failed to add to activities list.',
  },
  PASSWORDLESS: {
    VERIFY: 'W-137: Could not verify credentials.',
  },
  REDIRECT: {
    FAILED_CONTACT:
      'W-138: Could not contact parent page causing login failure. Retry login.',
    LOGIN_FAILED: 'W-139: Could not login, an unexpected error occurred',
  },
  STORAGE: {
    FAILED:
      "W-140: Local or session storage doesn't work, falling back to in-memory storage.",
  },
  VALIDATE_TOKEN: {
    PARAMS_MISSING: 'W-141: Required params missing',
    ALREADY_ADDED: 'W-142: Token already added',
    BELONGS_ETH: 'W-143: Token belongs to Ethereum Mainnet',
    INVALID_CONTRACT: 'W-144: Invalid contract address',
    NOT_OWNED: 'W-145: You do not own this token',
    INVALID_TOKEN: 'W-146: Invalid token',
    FAILED_TO_FETCH: 'W-147: Failed to fetch details',
  },
}
export { errors, content }

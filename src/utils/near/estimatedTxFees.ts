// Source: https://docs.near.org/concepts/protocol/gas#cost-for-common-actions

export const estimatedNearTxFees = {
  createAccount: 0.000042,
  transfer: 0.000045,
  addKey: 0.000042,
  deleteKey: 0.000041,
  functionCall: 0.03,
  deployContract: 0.000265,
  addAccount: 0,
  deleteAccount: 0,
}

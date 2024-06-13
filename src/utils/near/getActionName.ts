import type { Action } from 'near-api-js/lib/transaction'

export function getActionName(action: Action) {
  if (action.functionCall) {
    return 'Function Call'
  }
  if (action.deployContract) {
    return 'Deploy Contract'
  }
  if (action.stake) {
    return 'Stake'
  }
  if (action.transfer) {
    return 'Transfer'
  }
  if (action.createAccount) {
    return 'Create Account'
  }
  if (action.deleteAccount) {
    return 'Delete Account'
  }
  if (action.addKey) {
    return 'Add Key'
  }
  if (action.deleteKey) {
    return 'Delete Key'
  }
  if (action.signedDelegate) {
    return 'Signed Delegate'
  }
  return 'Unknown'
}

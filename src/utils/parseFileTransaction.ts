import { ethers } from 'ethers'

import arcanaAbi from '@/abis/arcana.abi.json'
import { ContractFunction } from '@/utils/contractFunctionToOperationMap'

function parseFileTransaction(param: string) {
  const iface = new ethers.utils.Interface(arcanaAbi)
  const data = {
    value: ethers.constants.Zero,
    data: param,
  }
  const pt = iface.parseTransaction(data)

  return { name: pt.functionFragment.name as ContractFunction, args: pt.args }
}

export { parseFileTransaction }

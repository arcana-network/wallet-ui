import Decimal from 'decimal.js'

import { getRequestHandler } from '@/utils/requestHandlerSingleton'

function convertGweiToEth(value) {
  const decimals = getRequestHandler().getAccountHandler().decimals
  const gasDecimals = getRequestHandler().getAccountHandler().gasDecimals
  return new Decimal(value)
    .mul(Decimal.pow(10, gasDecimals))
    .ceil()
    .div(Decimal.pow(10, decimals))
    .toDecimalPlaces(decimals)
}

export { convertGweiToEth }

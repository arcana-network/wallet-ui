import Decimal from 'decimal.js'

function formatTokenDecimals(balance: string | number, decimals = 0) {
  return new Decimal(balance).div(Decimal.pow(10, decimals)).toNumber()
}

function beautifyBalance(balance: number, decimals = 3) {
  const base = Math.pow(10, decimals)
  return Math.round(balance * base) / base
}

export { formatTokenDecimals, beautifyBalance }

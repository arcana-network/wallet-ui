function formatTokenDecimals(balance: string | number, decimals = 0) {
  const divider = Math.pow(10, decimals)
  if (typeof balance !== 'number') {
    balance = Number(balance)
  }
  return balance / divider
}

function beautifyBalance(balance: number, decimals = 2) {
  const base = Math.pow(10, decimals)
  return Math.round(balance * base) / base
}

export { formatTokenDecimals, beautifyBalance }

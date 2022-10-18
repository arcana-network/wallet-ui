function truncateToTwoDecimals(val: string): string {
  const results = val.match(/^-?\d+(?:\.\d{0,2})?/)
  return results ? results[0] : val
}

export { truncateToTwoDecimals }

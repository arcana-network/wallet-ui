function truncateToTwoDecimals(val: string) {
  return val.match(/^-?\d+(?:\.\d{0,2})?/)[0]
}

export { truncateToTwoDecimals }

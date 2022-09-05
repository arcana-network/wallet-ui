function truncateToTwoDecimals(val: string) {
  console.log({ val }, 'truncateToTwoDecimals')
  return val.match(/^-?\d+(?:\.\d{0,2})?/)[0]
}

export { truncateToTwoDecimals }

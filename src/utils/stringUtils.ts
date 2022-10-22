function truncateEnd(val: string, length = 4) {
  if (!val) return ''
  if (val.length > length) {
    return val.substring(0, length) + '...'
  }
  return val
}

function truncateMid(val: string, length = 4) {
  if (!val) return ''
  const allowedLength = length * 2
  if (val.length > allowedLength) {
    return (
      val.substring(0, length) + '....' + val.substring(val.length - length)
    )
  }
  return val
}

export { truncateEnd, truncateMid }

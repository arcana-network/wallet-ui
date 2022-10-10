function toFixed(n: number) {
  const s = n.toString()
  if (s.includes('e-')) {
    const [predicate, decimals] = s.split('e-')
    const afterDecimal = predicate.split('.')[1]
    if (afterDecimal) return n.toFixed(Number(decimals)) + afterDecimal
    return n.toFixed(Number(decimals))
  }
  return s
}

export { toFixed }

function toHex(value: string) {
  if (!value.startsWith('0x')) {
    return `0x${value}`
  }
  return value
}

export { toHex }

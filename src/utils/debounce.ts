function debounce(callback, timeout = 1000) {
  let timer: ReturnType<typeof setTimeout>
  return (...params: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      callback(...params)
    }, timeout)
  }
}

export default debounce

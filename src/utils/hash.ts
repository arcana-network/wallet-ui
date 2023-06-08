function atobUTF8(str: string) {
  return decodeURIComponent(
    Array.from(window.atob(str), byteToPercent).join('')
  )
}

function byteToPercent(b: string) {
  return `%${`00${b.charCodeAt(0).toString(16)}`.slice(-2)}`
}

export function decodeJSON(queryString: string) {
  return JSON.parse(atobUTF8(queryString))
}

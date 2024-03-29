export function downloadFile(filename: string, blob: Blob) {
  const anchorTag = window.document.createElement('a')
  anchorTag.href = window.URL.createObjectURL(blob)
  anchorTag.download = filename

  anchorTag.click()

  anchorTag.remove()
}

<script setup lang="ts">
const hash = window.location.hash.substring(1)
function byteToPercent(b: string) {
  return `%${`00${b.charCodeAt(0).toString(16)}`.slice(-2)}`
}

function atobUTF8(str: string) {
  return decodeURIComponent(Array.from(atob(str), byteToPercent).join(''))
}

function decodeJSON<T>(queryString: string): T {
  return JSON.parse(atobUTF8(unescape(queryString)))
}

console.log(decodeJSON(hash))
</script>

<template>
  <div></div>
</template>

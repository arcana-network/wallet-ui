<script setup lang="ts">
defineProps({
  value: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <json-viewer :value="value" theme="json-viewer"></json-viewer>
</template>

<style>
.json-viewer {
  font-size: var(--fs-300);
  font-weight: 400;
  background: transparent;
}

.json-viewer .jv-code {
  padding: 0;
}

.json-viewer .jv-key {
  color: #932a9b;
}

.json-viewer .jv-push {
  color: #c9302c;
}

.json-viewer .jv-string {
  word-break: break-all;
}
</style>

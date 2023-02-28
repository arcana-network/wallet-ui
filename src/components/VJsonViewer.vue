<script setup lang="ts">
type ViewerProps = {
  value: string | JSON
}

defineProps<ViewerProps>()
</script>

<template>
  <json-viewer
    :value="value"
    :expand-depth="3"
    theme="json-viewer"
  ></json-viewer>
</template>

<style>
.json-viewer {
  font-size: var(--fs-300);
  font-weight: 400;
  background: transparent;
}

.jv-code {
  padding: 0 !important;
}

.jv-key {
  color: var(--fg-color);
}

.jv-push {
  color: var(--fg-color);
}

.jv-string {
  word-break: break-all;
}
</style>

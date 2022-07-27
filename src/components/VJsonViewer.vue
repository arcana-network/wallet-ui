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

<style lang="scss">
.json-viewer {
  font-size: var(--fs-300);
  font-weight: 400;
  background: transparent;

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
}
</style>

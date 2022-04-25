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
    padding: 0;
  }

  .jv-key {
    color: #932a9b;
  }

  .jv-push {
    color: #c9302c;
  }
}
</style>

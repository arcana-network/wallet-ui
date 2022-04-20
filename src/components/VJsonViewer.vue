<script setup>
const props = defineProps({
  value: JSON,
})
</script>

<template>
  <json-viewer :value="props.value" theme="json-viewer"></json-viewer>
</template>

<style lang="scss">
.json-viewer {
  font-size: 10px;
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

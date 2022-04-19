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
  background: transparent;
  font-weight: 400;
  font-size: 10px;

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

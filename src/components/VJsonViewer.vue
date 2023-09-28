<script setup lang="ts">
import { computed } from 'vue'

type ViewerProps = {
  value: string | JSON
}

const props = defineProps<ViewerProps>()

const jsonValue = computed(() => {
  if (typeof props.value === 'string') {
    try {
      return JSON.parse(props.value)
    } catch (e) {
      return props.value
    }
  }
  if (props.value instanceof Array) {
    return props.value[0]
  }
  return props.value
})

const propKeys = computed(() => Object.keys(jsonValue.value))

function isArray(value: any) {
  if (value instanceof Array) {
    return true
  }
  return false
}

function hasObject(value: any) {
  if (typeof value === 'object') {
    return true
  }
  return false
}

function isString(value: any) {
  if (typeof value === 'string') {
    return true
  }
  return false
}
</script>

<template>
  <div class="flex flex-col">
    <pre
      v-if="isString(jsonValue)"
      class="jv-string json-viewer whitespace-pre-wrap break-words"
    >
      {{ jsonValue }}
    </pre>
    <div v-else class="flex flex-col">
      <div v-for="propKey in propKeys" :key="propKey" class="json-viewer">
        <pre class="jv-key">{{ propKey }}:</pre>
        <div v-if="isArray(jsonValue[propKey])" class="flex flex-col">
          <br />
          <div v-for="val in jsonValue[propKey]" :key="JSON.stringify(val)">
            <pre v-if="isString(val)" class="jv-push">"{{ val }}"</pre>
            <VJsonViewer v-else :value="val" />
          </div>
        </div>
        <div v-else-if="hasObject(jsonValue[propKey])">
          <br />
          <div>
            <VJsonViewer :value="jsonValue[propKey]" />
          </div>
        </div>
        <pre v-else class="jv-string jv-push ml-1">{{
          isString(jsonValue[propKey])
            ? `"${jsonValue[propKey]}"`
            : jsonValue[propKey]
        }}</pre>
      </div>
    </div>
  </div>
</template>

<style>
.json-viewer {
  display: flex;
  font-size: 10px;
}

.jv-code {
  padding: 0 !important;
}

.jv-key {
  color: #05c168;
}

.jv-push {
  color: #3e9aff;
}

.jv-gap {
  margin-left: 4px;
}

.jv-string {
  word-break: break-all;
}
</style>

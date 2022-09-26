<script setup lang="ts">
type TabProps = {
  tabs: string[]
  modelValue: string
}

const props = defineProps<TabProps>()
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex rounded-md tab-container">
    <div
      v-for="(tab, index) in props.tabs"
      :key="`tab-${index}-${tab}`"
      class="flex grow justify-center cursor-pointer py-[5px] font-semibold text-xl color-secondary rounded-md"
      :class="
        tab === props.modelValue
          ? 'bg-black dark:bg-white text-white dark:text-black tab-shadow'
          : ''
      "
      @click.stop="emit('update:modelValue', tab)"
    >
      {{ tab }}
    </div>
  </div>
</template>

<style scoped>
.tab-container {
  background: var(--container-bg-color);
}
</style>

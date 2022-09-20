<script setup lang="ts">
type TabProps = {
  tabs: string[]
  modelValue: string
}

const props = defineProps<TabProps>()
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex">
    <div
      v-for="(tab, index) in props.tabs"
      :key="`tab-${index}-${tab}`"
      class="flex grow justify-center cursor-pointer py-[10px] font-semibold tab"
      :class="
        tab === props.modelValue
          ? 'bg-black dark:bg-white text-white dark:text-black'
          : ''
      "
      @click.stop="emit('update:modelValue', tab)"
    >
      {{ tab }}
    </div>
  </div>
</template>

<style>
.tab {
  font-size: var(--fs-500);
  color: var(--fg-color-secondary);
  border: 1px var(--fg-color-secondary);
  border-style: solid none;
}
</style>

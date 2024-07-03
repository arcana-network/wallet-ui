<script setup lang="ts">
type TabProps = {
  tabs: string[]
  modelValue: string
}

const props = defineProps<TabProps>()
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex rounded-[5px] tab-container">
    <div
      v-for="(tab, index) in props.tabs"
      :key="`tab-${index}-${tab}`"
      class="flex grow justify-center cursor-pointer py-2 font-medium text-base sm:text-xs rounded-md"
      :class="{
        'bg-black dark:bg-white text-white dark:text-black tab-shadow':
          tab === props.modelValue,
        'color-secondary hover:text-black dark:hover:text-white':
          tab !== props.modelValue,
      }"
      @click.stop="emit('update:modelValue', tab)"
    >
      {{ tab }}
    </div>
  </div>
</template>

<style scoped>
.tab-container {
  background: var(--debossed-box-color);
  box-shadow: var(--tab-container-shadow);
}
</style>

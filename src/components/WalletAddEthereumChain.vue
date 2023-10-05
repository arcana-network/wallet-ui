<script setup lang="ts">
import Decimal from 'decimal.js'
import { computed } from 'vue'

const props = defineProps({
  params: {
    type: Object,
    required: true,
  },
})

const chainId = computed(() => new Decimal(props.params.chainId).toString())
</script>

<template>
  <div class="flex flex-col gap-2 text-sm">
    <div class="text-sm font-medium">Chain Details</div>
    <div v-if="props.params?.chainId" class="flex justify-between gap-4">
      <span class="w-[120px]">Chain Id</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="chainId"
      >
        {{ chainId }}
      </span>
    </div>
    <div v-if="props.params?.chainName" class="flex justify-between gap-4">
      <span class="w-[120px]">Name</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="props.params?.chainName"
      >
        {{ props.params.chainName }}
      </span>
    </div>
    <div
      v-if="props.params?.nativeCurrency?.symbol"
      class="flex justify-between gap-4"
    >
      <span class="w-[120px]">Currency</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="props.params.nativeCurrency.symbol"
        >{{ props.params.nativeCurrency.symbol }}</span
      >
    </div>
    <div
      v-if="props.params?.rpcUrls?.length"
      class="flex justify-between gap-4"
    >
      <span class="w-[120px]">RPC</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="props.params.rpcUrls.join(', ')"
        >{{ props.params.rpcUrls[0] }}</span
      >
    </div>
    <div
      v-if="props.params?.blockExplorerUrls?.length"
      class="flex justify-between gap-4"
    >
      <span class="w-[120px]">Explorer</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="props.params.blockExplorerUrls.join(', ')"
        >{{ props.params.blockExplorerUrls[0] }}</span
      >
    </div>
  </div>
</template>

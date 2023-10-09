<script setup lang="ts">
import { getImage } from '@/utils/getImage'

const props = defineProps({
  params: {
    type: Object,
    required: true,
  },
})

function handleFallbackLogo(event) {
  event.target.src = getImage('blockchain-icon.png')
}
</script>

<template>
  <div class="flex flex-col gap-2 text-sm">
    <div class="text-sm font-medium">Token Details</div>
    <div v-if="props.params?.address" class="flex justify-between gap-4">
      <span class="w-[120px]">Contract</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="props.params.address"
      >
        {{ props.params.address }}
      </span>
    </div>
    <div v-if="props.params?.symbol" class="flex justify-between gap-4">
      <span class="w-[120px]">Symbol</span>
      <span
        class="w-[200px] text-right flex gap-1 items-center justify-end"
        :title="props.params.symbol"
      >
        <img
          :src="props.params.image || ''"
          class="h-4 w-4"
          @error="handleFallbackLogo"
        />
        <span class="whitespace-nowrap overflow-hidden text-ellipsis">{{
          props.params.symbol
        }}</span>
      </span>
    </div>
    <div v-if="props.params?.decimals" class="flex justify-between gap-4">
      <span class="w-[120px]">Decimals</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="props.params.decimals"
        >{{ props.params.decimals }}</span
      >
    </div>
  </div>
</template>

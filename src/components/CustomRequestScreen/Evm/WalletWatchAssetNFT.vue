<script setup lang="ts">
const props = defineProps({
  params: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="flex flex-col gap-2 text-sm">
    <div class="text-sm font-medium">NFT Details</div>
    <div
      v-if="props.params?.imageUrl"
      class="flex justify-center items-center my-2"
    >
      <img
        class="h-24 w-24 object-cover object-center rounded-[5px]"
        :src="props.params.imageUrl"
      />
    </div>
    <div class="flex justify-between gap-4">
      <span class="w-[120px]">NFT Type</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis uppercase"
      >
        {{ props.type }}
      </span>
    </div>
    <div v-if="props.params?.collectionName" class="flex justify-between gap-4">
      <span class="w-[120px]">Collection</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="props.params.collectionName"
      >
        {{ props.params.collectionName }}
      </span>
    </div>
    <div v-if="props.params?.name" class="flex justify-between gap-4">
      <span class="w-[120px]">Name</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="props.params.name"
      >
        {{ props.params.name }}
      </span>
    </div>
    <div v-if="props.params?.address" class="flex justify-between gap-4">
      <span class="w-[120px]">Contract</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="props.params.address"
      >
        {{ props.params.address }}
      </span>
    </div>
    <div v-if="props.params?.tokenId" class="flex justify-between gap-4">
      <span class="w-[120px]">Token ID</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="props.params.tokenId"
      >
        {{ props.params.tokenId }}
      </span>
    </div>
    <div
      v-if="props.type?.toLowerCase() === 'erc1155' && props.params?.balance"
      class="flex justify-between gap-4"
    >
      <span class="w-[120px]">Quantity Owned</span>
      <span
        class="w-[200px] text-right whitespace-nowrap overflow-hidden text-ellipsis"
        :title="props.params.balance"
        >{{ props.params.balance }}</span
      >
    </div>
  </div>
</template>

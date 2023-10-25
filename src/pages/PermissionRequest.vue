<script setup lang="ts">
import dayjs from 'dayjs'
import { connectToParent } from 'penpal'
import { ref } from 'vue'

import SendTransaction from '@/components/PermissionRequest/SendTransaction.vue'
import SignMessageAdvancedInfo from '@/components/signMessageAdvancedInfo.vue'
import { advancedInfo } from '@/utils/advancedInfo'
import { getImage } from '@/utils/getImage'
import { decodeJSON } from '@/utils/hash'
import { methodAndAction } from '@/utils/method'
import { truncateMid } from '@/utils/stringUtils'

interface ParentInterface {
  accept(): string
  reject(): void
}

const hash = window.location.hash.substring(1)

const htmlEl = document.getElementsByTagName('html')[0]
htmlEl.classList.add('dark')

const currentData = new Date()
const dateOfRequest = dayjs(currentData).format('MMM D, YYYY')
const timeOfRequest = dayjs(currentData).format('H:mm')
const data = ref({})
const actionName = ref('')
const from = ref('')

const decodedParams = decodeJSON(hash)
console.log({ decodedParams })

data.value = { ...decodedParams }
actionName.value = methodAndAction[decodedParams.method]
from.value = decodedParams.params[0].from

const isSendTransactionRequest = (method: string) => {
  return method === 'eth_sendTransaction'
}

async function accept() {
  const parentConnection = await connectToParent<ParentInterface>().promise
  parentConnection.accept()
}

async function reject() {
  const parentConnection = await connectToParent<ParentInterface>().promise
  parentConnection.reject()
}
</script>

<template>
  <div class="flex flex-col space-y-3">
    <div class="flex space-x-2 bg-[#1F1F1F] p-4 rounded-md">
      <img
        :src="getImage('arrow-circle-bi-dir.png')"
        alt="arrow-icon"
        class="w-8 h-8"
      />
      <div class="space-y-1">
        <h1>{{ actionName }}</h1>
        <p class="text-xs text-[#8D8D8D]">{{ truncateMid(from, 6) }}</p>
        <div class="flex justify-between text-xs text-[#8D8D8D]">
          <span>{{ dateOfRequest }}</span>
          <span>{{ timeOfRequest }}</span>
        </div>
      </div>
    </div>
    <div class="bg-[#1F1F1F] p-4 rounded-md flex-1 flex flex-col space-y-4">
      <div class="flex-1">
        <SendTransaction
          v-if="isSendTransactionRequest(data.method)"
          :data="data"
        />
        <SignMessageAdvancedInfo
          v-else
          :info="advancedInfo(data.method, data.params)"
        />
      </div>
      <div class="flex gap-2">
        <button
          class="btn-secondary h-10 p-2 uppercase w-full text-sm font-bold"
          @click="reject"
        >
          Reject
        </button>
        <button
          class="btn-primary h-10 p-2 uppercase w-full text-sm font-bold"
          @click="accept"
        >
          Approve
        </button>
      </div>
    </div>
  </div>
</template>

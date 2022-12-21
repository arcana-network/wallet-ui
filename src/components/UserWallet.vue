<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AddNetwork from '@/components/AddNetwork.vue'
import ChangeChain from '@/components/ChangeChain.vue'
import EditNetwork from '@/components/EditNetwork.vue'
import ReceiveTokens from '@/components/ReceiveTokens.vue'
import SendTokens from '@/components/SendTokens.vue'
import {
  getExchangeRate,
  type CurrencySymbol,
} from '@/services/exchangeRate.service'
import { useModalStore } from '@/store/modal'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { truncateToTwoDecimals } from '@/utils/truncateToTwoDecimal'
import { useImage } from '@/utils/useImage'

type UserWalletProps = {
  walletBalance?: string
  page: 'home' | 'nft'
}

const props = defineProps<UserWalletProps>()
const emit = defineEmits(['show-loader', 'hide-loader', 'refresh'])
const router = useRouter()

const EXCHANGE_RATE_CURRENCY: CurrencySymbol = 'USD'
type ModalState = 'send' | 'receive' | 'add-network' | 'edit-network' | false

const userStore = useUserStore()
const modalStore = useModalStore()
const rpcStore = useRpcStore()
const toast = useToast()
const getImage = useImage()
const showModal: Ref<ModalState> = ref(false)
const { currency, selectedChainId } = storeToRefs(rpcStore)
const totalAmountInUSD: Ref<string | null> = ref(null)

const explorerUrl = computed(() => {
  if (
    rpcStore.selectedRpcConfig &&
    rpcStore.selectedRpcConfig.blockExplorerUrls?.length
  ) {
    const blockExplorerUrl = rpcStore.selectedRpcConfig.blockExplorerUrls[0]
    const walletAddress = userStore.walletAddress
    return `${blockExplorerUrl}/address/${walletAddress}`
  }
  return undefined
})

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success('Wallet address copied')
  } catch (err) {
    toast.error('Failed to copy wallet address')
  }
}

function showLoader(message: string) {
  emit('show-loader', { message })
}

function hideLoader() {
  emit('hide-loader')
}

function handleRefresh() {
  emit('refresh')
}

function openAddNetwork(open) {
  modalStore.setShowModal(open)
  showModal.value = open ? 'add-network' : false
}

function openEditNetwork(open, chainId: number | null = null) {
  modalStore.setShowModal(open)
  showModal.value = open ? 'edit-network' : false
  rpcStore.editChainId = chainId
}

function openSendTokens(open) {
  if (props.page === 'nft') {
    return router.push({ name: 'SelectNft' })
  } else {
    modalStore.setShowModal(open)
    showModal.value = open ? 'send' : false
  }
}

function openReceiveTokens(open) {
  modalStore.setShowModal(open)
  showModal.value = open ? 'receive' : false
}

async function getCurrencyExchangeRate() {
  showLoader('Fetching Currency Rate')
  totalAmountInUSD.value = null
  try {
    if (currency.value) {
      const rate = await getExchangeRate(
        currency.value as CurrencySymbol,
        EXCHANGE_RATE_CURRENCY
      )
      if (rate) {
        totalAmountInUSD.value = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(Math.round(Number(props.walletBalance) * rate))
      }
    }
  } catch (err) {
    console.log({ err })
    totalAmountInUSD.value = null
  } finally {
    hideLoader()
  }
}

onMounted(() => {
  if (props.walletBalance) {
    getCurrencyExchangeRate()
  }
})

watch(selectedChainId, () => {
  if (props.walletBalance) {
    getCurrencyExchangeRate()
  }
})
</script>

<template>
  <div>
    <div class="wallet__card rounded-[10px] flex flex-1 flex-col mb-6">
      <div class="px-4 py-5 sm:p-2 h-full flex flex-col justify-between">
        <div class="flex flex-col justify-center items-center space-y-2">
          <div class="flex items-center space-x-1">
            <p class="text-xl sm:text-sm">
              {{ userStore.walletAddressShrinked }}
            </p>
            <button
              class="h-4"
              @click="copyToClipboard(userStore.walletAddress)"
            >
              <img
                :src="getImage('copy-icon')"
                alt="copy icon"
                class="h-full"
              />
            </button>
          </div>
          <div class="flex items-center space-x-1 gap-4">
            <a
              v-if="explorerUrl"
              :href="explorerUrl"
              target="_blank"
              class="flex items-center space-x-1"
            >
              <img
                :src="getImage('arrow-up-right-icon')"
                alt="Explore"
                class="h-4"
              />
              <span class="text-xs">View on Explorer</span>
            </a>
            <button class="flex items-center" @click="handleRefresh">
              <img
                :src="getImage('refresh-icon')"
                alt="Refresh wallet balance"
                class="w-4"
              />
              <span class="text-xs">Refresh</span>
            </button>
          </div>
        </div>
        <div class="space-y-1 relative pb-14 sm:pb-8 mt-4">
          <p class="text-xs text-zinc-400">Network</p>
          <div class="w-full rounded-lg absolute">
            <ChangeChain
              @add-network="openAddNetwork(true)"
              @edit-network="(chainId) => openEditNetwork(true, chainId)"
            />
          </div>
        </div>
        <div
          v-if="props.walletBalance"
          class="flex-1 w-full rounded-lg mx-auto flex flex-col justify-center items-center space-y-2 sm:space-y-0 debossed-card mt-5"
        >
          <div
            class="p-4 sm:p-2 h-full flex flex-col justify-between space-y-5 sm:space-y-3 overflow-auto"
          >
            <div
              class="flex-1 w-full rounded-lg mx-auto flex flex-col justify-center items-center space-y-2 sm:space-y-0"
            >
              <p class="text-sm sm:text-xs">Total Balance</p>
              <div
                v-if="totalAmountInUSD"
                class="space-y-2 sm:space-y-0 flex flex-col items-center"
              >
                <p class="text-2xl sm:text-base text-center">
                  {{ totalAmountInUSD }}
                </p>
                <div class="flex text-zinc-400 text-sm space-x-1">
                  <p :title="props.walletBalance">
                    {{ truncateToTwoDecimals(props.walletBalance) }}
                  </p>
                  <p>{{ currency }}</p>
                </div>
              </div>
              <div v-else>
                <div class="flex text-2xl sm:text-base space-x-1">
                  <p :title="props.walletBalance">
                    {{ truncateToTwoDecimals(props.walletBalance) }}
                  </p>
                  <p>{{ currency }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex space-x-3 mt-5">
          <button
            class="text-sm sm:text-xs rounded-xl border-2 border-solid border-black dark:border-white flex-1 uppercase"
            @click="openSendTokens(true)"
          >
            Send
          </button>
          <button
            class="text-sm sm:text-xs rounded-xl border-2 border-solid border-black dark:border-white flex-1 uppercase"
            @click="openReceiveTokens(true)"
          >
            Receive
          </button>
        </div>
      </div>
    </div>
    <Teleport v-if="showModal" to="#modal-container">
      <SendTokens v-if="showModal === 'send'" @close="openSendTokens(false)" />
      <ReceiveTokens
        v-if="showModal === 'receive'"
        @close="openReceiveTokens(false)"
      />
      <AddNetwork
        v-if="showModal === 'add-network'"
        @close="openAddNetwork(false)"
      />
      <EditNetwork
        v-if="showModal === 'edit-network'"
        @close="openEditNetwork(false)"
      />
    </Teleport>
  </div>
</template>

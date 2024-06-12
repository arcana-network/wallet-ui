<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import Decimal from 'decimal.js'
import { storeToRefs } from 'pinia'
import { computed, ref, watch, onBeforeMount, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AddNetwork from '@/components/AddNetwork.vue'
import BuyTokens from '@/components/BuyTokens.vue'
import EditNetwork from '@/components/EditNetwork.vue'
import SellTokens from '@/components/SellTokens.vue'
import { useAppStore } from '@/store/app'
import useCurrencyStore from '@/store/currencies'
import { useModalStore } from '@/store/modal'
import { useRpcStore } from '@/store/rpc'
import { useStarterTipsStore } from '@/store/starterTips'
import { useUserStore } from '@/store/user'
import { ChainType } from '@/utils/chainType'
import { content, errors } from '@/utils/content'
import { getImage } from '@/utils/getImage'
import { isSupportedByOnRampMoney } from '@/utils/onrampmoney.ramp'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { truncateMid } from '@/utils/stringUtils'
import {
  getTransakSupportedNetworks,
  fetchTransakNetworks,
  getTransakSellableNetworks,
} from '@/utils/transak'

type UserWalletProps = {
  page: 'home' | 'nft'
  refreshIconAnimating: boolean
}

const isRampDataFetched = ref(false)

onBeforeMount(async () => {
  try {
    await Promise.all([fetchTransakNetworks()])
    isRampDataFetched.value = true
  } catch (e) {
    console.error(errors.TRANSAK.FAILED_INITIALIZATION, e)
  }
})

const props = defineProps<UserWalletProps>()
const emit = defineEmits(['show-loader', 'hide-loader', 'refresh'])
const router = useRouter()
const toast = useToast()
const starterTipsStore = useStarterTipsStore()

type ModalState =
  | 'send'
  | 'receive'
  | 'add-network'
  | 'edit-network'
  | 'buy'
  | 'sell'
  | false

const userStore = useUserStore()
const modalStore = useModalStore()
const rpcStore = useRpcStore()
const appStore = useAppStore()
const showModal: Ref<ModalState> = ref(false)
const { currency } = storeToRefs(rpcStore)
const chainSelectedForEdit: Ref<number | null> = ref(null)
const showAddressListDropDown = ref(false)

const currencyStore = useCurrencyStore()
const walletBalance = computed(() => {
  const DecimalPow = getRequestHandler().getAccountHandler().decimals
  return rpcStore.walletBalance
    ? new Decimal(rpcStore.walletBalance)
        .div(Decimal.pow(10, DecimalPow))
        .toDecimalPlaces(9)
        .toString()
    : '0'
})
const walletBalanceInCurrency = computed(() => {
  const rpcSymbol = rpcStore.selectedRpcConfig?.nativeCurrency?.symbol
  if (!rpcSymbol) {
    return null
  }
  const chainType = rpcStore.selectedRpcConfig?.chainType
  if (chainType?.toLowerCase() === 'testnet') {
    return null
  }
  if (rpcStore.selectedRPCConfig?.nativeCurrency?.symbol) {
    const perTokenPrice =
      currencyStore.currencies[rpcStore.selectedRPCConfig.nativeCurrency.symbol]
    if (!perTokenPrice) {
      return null
    }
    const currencySymbol = currencyStore.getCurrencySymbol
    return `${currencySymbol}${new Decimal(rpcStore.walletBalance)
      .div(Decimal.pow(10, getRequestHandler().getAccountHandler().decimals))
      .mul(Decimal.div(1, perTokenPrice))
      .toDecimalPlaces(2)
      .toString()}`
  }
  return null
})

const addresses = ref([
  {
    type: 'eoa',
    address: userStore.ownerWalletAddress,
    label: 'Externally Owned Address',
  },
  {
    type: 'scw',
    address: userStore.scwAddress,
    label: 'Smart Contract Wallet Address',
  },
])

const selectedAddressType = ref(
  addresses.value.find(
    (address) => address.type === rpcStore.preferredAddressType
  ) || addresses.value[0]
)

// TODO: move these to something else scoped to onramps

const transakNetwork = computed(() => {
  if (!isRampDataFetched.value) return false
  switch (appStore.chainType) {
    case ChainType.evm_secp256k1: {
      const selectedChainId = Number(rpcStore.selectedChainId)
      return getTransakSupportedNetworks().find(
        (network) => network.chainId === selectedChainId
      )
    }
    case ChainType.solana_cv25519:
      return {
        value: 'solana',
      }
    case ChainType.multiversx_cv25519:
      return {
        value: 'multiversx',
      }
    case ChainType.near_cv25519:
      return {
        value: 'near',
      }
    default:
      return false
  }
})

const transakSellNetwork = computed(() => {
  if (!isRampDataFetched.value) return []
  const selectedChainId = Number(rpcStore.selectedChainId)
  return getTransakSellableNetworks().find(
    (network) => network.chainId === selectedChainId
  )
})

const onRampMoney = computed(() => {
  const selectedChainId = Number(rpcStore.selectedChainId)
  if (
    appStore.chainType === ChainType.evm_secp256k1 &&
    isSupportedByOnRampMoney(selectedChainId)
  ) {
    return selectedChainId
  } else {
    return false
  }
})

function handleRefresh() {
  emit('refresh')
}

function openAddNetwork(open) {
  modalStore.setShowModal(open)
  showModal.value = open ? 'add-network' : false
}

function openEditNetwork(open, chainId: number | null = null) {
  if (rpcStore.selectedRpcConfig) {
    if (Number(rpcStore.selectedRpcConfig.chainId) === Number(chainId)) {
      toast.error(content.NETWORK.INPUT_EXISTS)
    } else {
      chainSelectedForEdit.value = chainId
      modalStore.setShowModal(open)
      showModal.value = open ? 'edit-network' : false
    }
  }
}

function goToSendTokens() {
  if (props.page === 'nft') {
    router.push({ name: 'SelectNft' })
  } else {
    router.push({ name: 'SendTokens' })
  }
}

function handleBuy(open: boolean) {
  modalStore.setShowModal(open)
  showModal.value = open ? 'buy' : false
}

function handleSell(open: boolean) {
  modalStore.setShowModal(open)
  showModal.value = open ? 'sell' : false
}

function hasWalletBalanceAfterDecimals() {
  if (walletBalance.value?.includes('.')) {
    const balance = walletBalance.value.split('.')
    if (Number(balance[1]) > 0) {
      return true
    }
  }
  return false
}

// watch(
//   () => rpcStore.selectedRPCConfig?.chainId,
//   async () => {
//     if (rpcStore.selectedRPCConfig) {
//       await getRequestHandler().setRpcConfig({
//         ...rpcStore.selectedRPCConfig,
//         chainId: Number(rpcStore.selectedRPCConfig.chainId),
//       })
//     }
//   }
// )

watch(
  () => userStore.scwAddress,
  () => {
    addresses.value[1].address = userStore.scwAddress
    emit('refresh')
  }
)

watch(
  () => selectedAddressType.value,
  () => {
    const addressType = selectedAddressType.value.type
    rpcStore.setPreferredWalletAddressType(addressType as 'eoa' | 'scw')
    emit('refresh')
  }
)

watch(
  () => modalStore.show,
  (show) => {
    if (!show) showModal.value = false
  }
)

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(content.WALLET.COPY)
  } catch (err) {
    toast.error(errors.WALLET.COPY)
  }
}
</script>

<template>
  <div>
    <div class="card p-3 flex flex-col rounded-xl">
      <div class="flex flex-col justify-between space-y-1">
        <div
          class="flex justify-between rounded-md relative"
          :class="{
            'z-[999] startertips_highlighted':
              starterTipsStore.showWalletAddress,
          }"
        >
          <Listbox v-slot="{ open }" v-model="selectedAddressType">
            <ListboxButton class="flex justify-between items-center">
              <button
                class="flex items-center space-x-2"
                @click.stop="showAddressListDropDown = true"
              >
                <img
                  src="@/assets/images/fallback-logo-dark-mode.png"
                  class="w-xxl h-xxl rounded-full"
                />
                <div class="flex flex-col0">
                  <div class="flex">
                    <div class="flex flex-col items-start">
                      <span
                        class="font-bold text-lg dark:text-[#FFFFFF] text-[#000000]"
                        >{{ truncateMid(selectedAddressType.address, 6) }}</span
                      >
                      <span class="text-left text-xs text-[#8d8d8d]">{{
                        selectedAddressType.label
                      }}</span>
                    </div>
                    <button
                      title="Click to copy wallet address"
                      class="self-start"
                      @click.stop="copyToClipboard(selectedAddressType.address)"
                    >
                      <img :src="getImage('copy.svg')" class="w-xl h-xl" />
                    </button>
                  </div>
                </div>
              </button>
              <img
                v-if="
                  rpcStore.isGaslessConfigured &&
                  !starterTipsStore.showWalletAddress
                "
                :src="getImage('arrow-down.svg')"
                class="w-xl h-xl transition-transform"
                :class="{ 'rotate-180': open }"
              />
            </ListboxButton>
            <div v-if="open && rpcStore.isGaslessConfigured">
              <ListboxOptions
                class="divide-y-2 dark:divide-[#8d8d8d] divide-[#eff1f3] mt-2 p-2 rounded-md absolute top-12 dark:bg-[#313131] bg-[#FFFFFF] w-full left-0 z-[999]"
              >
                <ListboxOption
                  v-for="address in addresses"
                  :key="address.type"
                  :value="address"
                  :disabled="address.address === selectedAddressType.address"
                >
                  <button
                    class="flex items-center space-x-2 py-2"
                    :class="{
                      'text-[#8d8d8d]':
                        address.address === selectedAddressType.address,
                    }"
                  >
                    <img
                      src="@/assets/images/fallback-logo-dark-mode.png"
                      class="w-xl h-xl rounded-full"
                    />
                    <div class="flex flex-col items-start">
                      <span
                        class="text-base dark:text-[#FFFFFF] text-[#000000]"
                        >{{ truncateMid(address.address, 6) }}</span
                      >
                      <span class="text-left text-xs text-[#8d8d8d]">{{
                        address.label
                      }}</span>
                    </div>
                  </button>
                </ListboxOption>
              </ListboxOptions>
            </div>
          </Listbox>
        </div>
      </div>
      <div class="mt-4 flex flex-col">
        <span
          v-if="appStore.chainType === ChainType.near_cv25519"
          class="font-normal text-gray-bermuda-grey dark:text-gray-spanish"
          >Available Balance:</span
        >
        <span
          v-else
          class="font-normal text-gray-bermuda-grey dark:text-gray-spanish"
          >Total Balance:</span
        >
        <div class="flex items-center gap-4">
          <div
            class="transition-all duration-200"
            :class="{ 'blur-sm': props.refreshIconAnimating }"
          >
            <span class="font-normal text-3xl">{{
              walletBalance?.split('.')[0]
            }}</span>
            <span
              v-if="hasWalletBalanceAfterDecimals()"
              class="font-normal text-3xl"
              >.</span
            >
            <span
              v-if="hasWalletBalanceAfterDecimals()"
              class="font-medium text-base"
              >{{ walletBalance?.split('.')[1] }}</span
            >
            <span v-if="currency" class="font-medium text-base ml-1">
              {{ currency }}</span
            >
            <span v-if="walletBalanceInCurrency" class="ml-2 text-sm"
              >({{ walletBalanceInCurrency }})</span
            >
          </div>
          <button
            class="w-lg h-lg rounded-full"
            :class="{ 'animate-spin': refreshIconAnimating }"
            title="Click to refresh the balance"
            @click.stop="handleRefresh()"
          >
            <img :src="getImage('refresh.svg')" />
          </button>
        </div>
      </div>
    </div>
    <div class="mt-4 flex gap-3">
      <button
        class="btn-quaternery flex gap-1 justify-center p-2 items-center font-medium text-base uppercase w-full"
        @click.stop="goToSendTokens()"
      >
        <img :src="getImage('send-icon.svg')" class="w-md h-md" />
        <span>Send</span>
      </button>
      <button
        class="btn-quaternery flex gap-1 justify-center p-2 items-center font-medium text-base uppercase w-full"
        :disabled="!transakNetwork && onRampMoney === false"
        :class="{
          'z-[999] startertips_highlighted': starterTipsStore.showBuyButton,
        }"
        @click.stop="handleBuy(true)"
      >
        <img :src="getImage('buy-icon.svg')" class="w-md h-md" />
        <span>Buy</span>
      </button>
      <button
        class="btn-quaternery flex gap-1 justify-center p-2 items-center font-medium text-base uppercase w-full"
        :disabled="!transakSellNetwork"
        :class="{
          'z-[999] startertips_highlighted': starterTipsStore.showBuyButton,
        }"
        @click.stop="handleSell(true)"
      >
        <img :src="getImage('sell.svg')" class="w-md h-md" />
        <span>Sell</span>
      </button>
    </div>
    <Teleport v-if="modalStore.show" to="#modal-container">
      <AddNetwork
        v-if="showModal === 'add-network'"
        @close="openAddNetwork(false)"
      />
      <EditNetwork
        v-if="showModal === 'edit-network'"
        :chain-id="(chainSelectedForEdit as number)"
        @close="openEditNetwork(false)"
      />
      <BuyTokens
        v-if="showModal === 'buy'"
        :transak-network="transakNetwork?.value"
        @close="handleBuy(false)"
      />
      <SellTokens
        v-if="showModal === 'sell'"
        :transak-network="transakSellNetwork?.value"
        @close="handleSell(false)"
      />
    </Teleport>
  </div>
</template>

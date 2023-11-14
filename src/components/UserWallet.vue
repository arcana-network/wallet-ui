<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import Decimal from 'decimal.js'
import { storeToRefs } from 'pinia'
import { computed, ref, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AddNetwork from '@/components/AddNetwork.vue'
import BuyTokens from '@/components/BuyTokens.vue'
import EditNetwork from '@/components/EditNetwork.vue'
import useCurrencyStore from '@/store/currencies'
import { useModalStore } from '@/store/modal'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { getImage } from '@/utils/getImage'
import { isSupportedByOnRampMoney } from '@/utils/onrampmoney.ramp'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { truncateMid } from '@/utils/stringUtils'
import { getTransakSupportedNetworks } from '@/utils/transak'

type UserWalletProps = {
  page: 'home' | 'nft'
  refreshIconAnimating: boolean
}

const props = defineProps<UserWalletProps>()
const emit = defineEmits(['show-loader', 'hide-loader', 'refresh'])
const router = useRouter()
const toast = useToast()

type ModalState =
  | 'send'
  | 'receive'
  | 'add-network'
  | 'edit-network'
  | 'buy'
  | false

const userStore = useUserStore()
const modalStore = useModalStore()
const rpcStore = useRpcStore()
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
      .div(Decimal.pow(10, 18))
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
  const selectedChainId = Number(rpcStore.selectedChainId)
  return getTransakSupportedNetworks().find(
    (network) => network.chainId === selectedChainId
  )
})

const onRampMoney = computed(() => {
  const selectedChainId = Number(rpcStore.selectedChainId)
  if (isSupportedByOnRampMoney(selectedChainId)) {
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
      toast.error(
        'This network is current selected, please chose a different one and try again'
      )
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
    toast.success('Wallet address copied')
  } catch (err) {
    toast.error('Failed to copy wallet address')
  }
}
</script>

<template>
  <div>
    <div class="card p-4 flex flex-col">
      <div class="flex flex-col justify-between space-y-1">
        <span class="text-[#8D8D8D] text-sm">Wallet</span>
        <div
          class="dark:bg-[#313131] bg-[#FFFFFF] flex flex-col justify-between p-2 rounded-md relative"
        >
          <Listbox v-slot="{ open }" v-model="selectedAddressType">
            <ListboxButton class="flex justify-between items-center">
              <button
                class="flex items-center space-x-2"
                @click.stop="showAddressListDropDown = true"
              >
                <img
                  src="@/assets/images/fallback-logo-dark-mode.png"
                  class="w-xl h-xl rounded-full"
                />
                <div class="flex flex-col">
                  <div class="flex">
                    <span
                      class="font-bold text-lg dark:text-[#FFFFFF] text-[#000000]"
                      >{{ truncateMid(selectedAddressType.address, 6) }}</span
                    >
                    <button
                      title="Click to copy wallet address"
                      @click.stop="copyToClipboard(selectedAddressType.address)"
                    >
                      <img :src="getImage('copy.svg')" class="w-xl h-xl" />
                    </button>
                  </div>
                  <span class="text-left text-xs text-[#8d8d8d]">{{
                    selectedAddressType.label
                  }}</span>
                </div>
              </button>
              <img
                v-if="rpcStore.isGaslessConfigured"
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
                      <span class="text-base">{{
                        truncateMid(address.address, 6)
                      }}</span>
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
        <span class="font-normal text-sm text-gray-100">Total Balance:</span>
        <div class="flex items-center gap-4">
          <div
            class="transition-all duration-200"
            :class="{ 'blur-sm': props.refreshIconAnimating }"
          >
            <span class="font-bold text-xxl">{{
              walletBalance?.split('.')[0]
            }}</span>
            <span
              v-if="hasWalletBalanceAfterDecimals()"
              class="font-bold text-xxl"
              >.</span
            >
            <span
              v-if="hasWalletBalanceAfterDecimals()"
              class="font-bold text-base"
              >{{ walletBalance?.split('.')[1] }}</span
            >
            <span v-if="currency" class="font-bold text-base ml-1">
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
      <div class="mt-6 flex gap-3">
        <button
          class="btn-secondary flex gap-1 justify-center p-2 items-center font-bold text-sm uppercase w-full"
          @click.stop="goToSendTokens()"
        >
          <img :src="getImage('send-icon.svg')" class="w-md h-md" />
          Send
        </button>
        <button
          class="btn-secondary flex gap-1 justify-center p-2 items-center font-bold text-sm uppercase w-full"
          :disabled="!transakNetwork && onRampMoney === false"
          @click.stop="handleBuy(true)"
        >
          <img :src="getImage('buy-icon.svg')" class="w-md h-md" />
          Buy
        </button>
      </div>
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
        :on-ramp-money="onRampMoney"
        @close="handleBuy(false)"
      />
    </Teleport>
  </div>
</template>

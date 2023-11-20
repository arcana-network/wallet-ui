<script setup lang="ts">
import {
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { Decimal } from 'decimal.js'
import { onMounted, onUnmounted, ref, Ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import GasPrice from '@/components/GasPrice.vue'
import SendTokensPreview from '@/components/SendTokensPreview.vue'
import { useActivitiesStore } from '@/store/activities'
import { useAppStore } from '@/store/app'
import type { EIP1559GasFee } from '@/store/request'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { EVMAccountHandler, SolanaAccountHandler } from '@/utils/accountHandler'
import { ChainType } from '@/utils/chainType'
import { getTokenBalance } from '@/utils/contractUtil'
import { getImage } from '@/utils/getImage'
import { getRequestHandler } from '@/utils/requestHandlerSingleton'
import { getStorage } from '@/utils/storageWrapper'

const showPreview = ref(false)
const rpcStore = useRpcStore()
const userStore = useUserStore()
const activitiesStore = useActivitiesStore()
const router = useRouter()
const toast = useToast()
const isWalletAddressFocused = ref(false)
const isAmountFocused = ref(false)
const appStore = useAppStore()

const recipientWalletAddress = ref('')
const amount = ref('')
const gas: Ref<EIP1559GasFee | null> = ref(null)
const gasFeeInEth = ref('')
const estimatedGas = ref('0')
const gasPrices: Ref<object> = ref({})
const loader = ref({
  show: false,
  message: '',
})
const tokenList = ref([
  {
    symbol: rpcStore.nativeCurrency?.symbol,
    decimals: getRequestHandler().getAccountHandler().decimals,
    address: '',
  },
])
const baseFee = ref('0')
const selectedToken = ref(tokenList.value[0])
const selectedTokenBalance = ref('0')

const walletBalance = computed(() => {
  if (appStore.chainType === ChainType.solana_cv25519) {
    return new Decimal(rpcStore.walletBalance)
      .div(Decimal.pow(10, 9))
      .toString()
  }
  return new Decimal(rpcStore.walletBalance).div(Decimal.pow(10, 18)).toString()
})

watch(gas, () => {
  if (gas.value && appStore.chainType === ChainType.evm_secp256k1) {
    const maxFee = new Decimal(gas.value.maxFeePerGas).add(
      gas.value.maxPriorityFeePerGas || 1.5
    )
    const maxFeeInWei = maxFee.mul(Decimal.pow(10, 9))
    gasFeeInEth.value = maxFeeInWei.div(Decimal.pow(10, 18)).toString()
  }
})

watch(selectedToken, async () => {
  await fetchTokenBalance()
})

function showLoader(message) {
  loader.value.show = true
  loader.value.message = `${message}...`
}

function hideLoader() {
  loader.value.show = false
  loader.value.message = ''
}

let baseFeePoll
let gasSliderPoll

onMounted(async () => {
  showLoader('Loading...')
  try {
    setTokenList()
    await fetchTokenBalance()
    if (appStore.chainType === ChainType.evm_secp256k1) {
      await fetchBaseFee()
      baseFeePoll = setInterval(fetchBaseFee, 2000)
      const accountHandler = getRequestHandler().getAccountHandler()
      if (rpcStore.nativeCurrency?.symbol === selectedToken.value.symbol) {
        estimatedGas.value = (
          await accountHandler.provider.estimateGas({
            from: userStore.walletAddress,
            to: recipientWalletAddress.value
              ? setHexPrefix(recipientWalletAddress.value)
              : userStore.walletAddress,
          })
        ).toString()
      } else {
        if (!rpcStore.useGasless) {
          const tokenInfo = tokenList.value.find(
            (item) => item.address === selectedToken.value.address
          )
          estimatedGas.value = (
            await accountHandler.estimateCustomTokenGas(
              tokenInfo?.address,
              recipientWalletAddress.value
                ? setHexPrefix(recipientWalletAddress.value)
                : userStore.walletAddress,
              new Decimal(Decimal.pow(10, 18)).toHexadecimal()
            )
          ).toString()
        }
      }
    }
  } catch (err) {
    console.log({ err })
  } finally {
    hideLoader()
  }
})

onUnmounted(() => {
  if (baseFeePoll) clearInterval(baseFeePoll)
  if (gasSliderPoll) clearInterval(gasSliderPoll)
})

async function fetchBaseFee() {
  const accountHandler = getRequestHandler().getAccountHandler()
  const baseGasPrice = (await accountHandler.provider.getGasPrice()).toString()
  baseFee.value = new Decimal(baseGasPrice).div(Decimal.pow(10, 9)).toString()
}

async function fetchTokenBalance() {
  const tokenInfo = tokenList.value.find(
    (item) => item.address === selectedToken.value.address
  )

  if (tokenInfo?.symbol === rpcStore.nativeCurrency?.symbol) {
    selectedTokenBalance.value = walletBalance.value
  } else {
    if (appStore.chainType === ChainType.solana_cv25519) {
      selectedTokenBalance.value = tokenInfo?.balance.toString() ?? '0'
    } else {
      const balance = await getTokenBalance({
        walletAddress: userStore.walletAddress,
        contractAddress: tokenInfo?.address as string,
      })
      selectedTokenBalance.value = tokenInfo?.decimals
        ? new Decimal(balance)
            .div(Decimal.pow(10, tokenInfo.decimals))
            .toFixed(tokenInfo.decimals)
        : new Decimal(balance).toString()
    }
  }
}

async function setTokenList() {
  const chainId = rpcStore.selectedChainId
  const walletAddress = userStore.walletAddress
  if (appStore.chainType === ChainType.solana_cv25519) {
    const accountHandler =
      getRequestHandler().getAccountHandler() as SolanaAccountHandler
    let tokens = accountHandler.storedTokens
    if (!tokens.length) {
      await accountHandler.getAllUserSPLTokens()
      tokens = accountHandler.storedTokens
    }
    tokenList.value.push(...tokens)
  } else {
    const contracts = getStorage().local.getAssetContractList(
      walletAddress,
      Number(chainId)
    )
    tokenList.value.push(...contracts)
  }
}

function clearForm() {
  recipientWalletAddress.value = ''
  amount.value = ''
  gas.value = null
}

function setHexPrefix(value: string) {
  const hexPrefix = '0x'
  return value.startsWith(hexPrefix) ? value : `${hexPrefix}${value}`
}

async function handleSendToken() {
  showLoader('Sending...')
  try {
    if (appStore.chainType === ChainType.solana_cv25519) {
      const accountHandler =
        getRequestHandler().getAccountHandler() as SolanaAccountHandler
      if (selectedToken.value.symbol === rpcStore.nativeCurrency?.symbol) {
        const blockHash = await accountHandler.getLatestBlockHash()
        const pk = accountHandler.publicKey
        const toPk = new PublicKey(recipientWalletAddress.value)
        const instructions = [
          SystemProgram.transfer({
            fromPubkey: pk,
            toPubkey: toPk,
            lamports: new Decimal(amount.value)
              .mul(Decimal.pow(10, 9))
              .toNumber(),
          }),
        ]
        const messageV0 = new TransactionMessage({
          payerKey: pk,
          recentBlockhash: blockHash,
          instructions,
        }).compileToV0Message()
        let transaction = new VersionedTransaction(messageV0)
        const transactionSent = await accountHandler.signAndSendTransaction(
          transaction.serialize()
        )
        activitiesStore.fetchAndSaveActivityFromHash({
          chainId: rpcStore.selectedRpcConfig?.chainId,
          txHash: transactionSent,
          chainType: ChainType.solana_cv25519,
        })
      } else {
        const sig = await accountHandler.sendCustomToken({
          to: recipientWalletAddress.value,
          amount: amount.value,
          mint: selectedToken.value.address,
          decimals: selectedToken.value.decimals,
        })
        const tokenInfo = tokenList.value.find(
          (item) => item.address === selectedToken.value.address
        )
        activitiesStore.fetchAndSaveActivityFromHash({
          txHash: sig,
          chainId: rpcStore.selectedRpcConfig?.chainId,
          customToken: {
            operation: 'Send',
            amount: amount.value,
            symbol: tokenInfo?.symbol as string,
            decimals: tokenInfo?.decimals as number,
          },
          recipientAddress: recipientWalletAddress.value,
          chainType: ChainType.solana_cv25519,
        })
      }
    } else {
      const accountHandler =
        getRequestHandler().getAccountHandler() as EVMAccountHandler
      let gasFees: string | null = null
      if (gas.value) {
        const maxFee = new Decimal(gas.value.maxFeePerGas).add(
          gas.value.maxPriorityFeePerGas || 1.5
        )
        const maxFeeInWei = maxFee.mul(Decimal.pow(10, 9))
        gasFees = maxFeeInWei.toHexadecimal()
      }
      if (selectedToken.value.symbol === rpcStore.nativeCurrency?.symbol) {
        const payload: any = {
          to: setHexPrefix(recipientWalletAddress.value),
          value: new Decimal(amount.value)
            .mul(Decimal.pow(10, 18))
            .toHexadecimal(),
          from: userStore.walletAddress,
        }

        if (gasFees) {
          payload.gasPrice = gasFees
        }
        payload.gasLimit = gas.value?.gasLimit || estimatedGas.value

        const txHash = await accountHandler.sendTransaction(
          payload,
          userStore.walletAddress
        )
        activitiesStore.fetchAndSaveActivityFromHash({
          chainId: rpcStore.selectedRpcConfig?.chainId,
          txHash,
        })
      } else {
        const tokenInfo = tokenList.value.find(
          (item) => item.address === selectedToken.value.address
        )
        const sendAmount = tokenInfo?.decimals
          ? new Decimal(amount.value)
              .mul(Decimal.pow(10, tokenInfo.decimals))
              .toHexadecimal()
          : new Decimal(amount.value).toHexadecimal()
        const transactionHash = await accountHandler.sendCustomToken(
          tokenInfo?.address,
          setHexPrefix(recipientWalletAddress.value),
          sendAmount,
          gasFees,
          estimatedGas.value
        )
        activitiesStore.fetchAndSaveActivityFromHash({
          chainId: rpcStore.selectedRpcConfig?.chainId,
          txHash: transactionHash,
          customToken: {
            operation: 'Send',
            amount: amount.value,
            symbol: tokenInfo?.symbol as string,
          },
          recipientAddress: setHexPrefix(recipientWalletAddress.value),
        })
      }
    }
    clearForm()
    router.push({ name: 'home' })
    toast.success('Tokens sent Successfully')
  } catch (error: any) {
    const displayMessage =
      ((error?.data?.originalError?.error?.message ||
        error?.data?.originalError?.reason ||
        error?.data?.originalError?.code ||
        error?.error?.message ||
        error?.message ||
        error?.reason) as string) || 'Something went wrong'
    toast.error(displayMessage)
  } finally {
    showPreview.value = false
    hideLoader()
  }
}

function handleSetGasPrice(value) {
  gas.value = value
}

async function handleShowPreview() {
  if (!gas.value && appStore.chainType === ChainType.evm_secp256k1) {
    gas.value = {
      maxFeePerGas: baseFee.value,
      maxPriorityFeePerGas: String(4),
      gasLimit: 0,
    }
  }
  if (appStore.chainType === ChainType.solana_cv25519) {
    if (recipientWalletAddress.value && amount.value) {
      showPreview.value = true
    } else {
      toast.error('Please fill all values')
    }
  } else {
    if (recipientWalletAddress.value && amount.value && gas.value) {
      showLoader('Loading preview...')
      try {
        const accountHandler =
          getRequestHandler().getAccountHandler() as EVMAccountHandler
        if (rpcStore.nativeCurrency?.symbol === selectedToken.value.symbol) {
          estimatedGas.value = (
            await accountHandler.provider.estimateGas({
              from: userStore.walletAddress,
              to: setHexPrefix(recipientWalletAddress.value),
              value: new Decimal(amount.value)
                .mul(Decimal.pow(10, 18))
                .toHexadecimal(),
            })
          ).toString()
        } else {
          const tokenInfo = tokenList.value.find(
            (item) => item.address === selectedToken.value.address
          )
          if (!rpcStore.useGasless) {
            const sendAmount = tokenInfo?.decimals
              ? new Decimal(amount.value)
                  .mul(Decimal.pow(10, tokenInfo.decimals))
                  .toString()
              : new Decimal(amount.value).toString()
            estimatedGas.value = (
              await accountHandler.estimateCustomTokenGas(
                tokenInfo?.address,
                setHexPrefix(recipientWalletAddress.value),
                new Decimal(sendAmount).toHexadecimal()
              )
            ).toString()
          }
        }
        const maxFee = new Decimal(gas.value.maxFeePerGas).add(
          gas.value.maxPriorityFeePerGas || 1.5
        )
        const maxFeeInWei = maxFee.mul(Decimal.pow(10, 9))
        gasFeeInEth.value = maxFeeInWei.div(Decimal.pow(10, 18)).toString()
        showPreview.value = true
      } catch (e) {
        toast.error('Cannot estimate gas fee. Please try again later.')
        console.error({ e })
      } finally {
        hideLoader()
      }
    } else {
      toast.error('Please fill all values')
    }
  }
}

function handleTokenChange(e) {
  selectedToken.value = JSON.parse(e.target.value)
}

watch(
  () => rpcStore.selectedChainId,
  () => {
    router.replace({ name: 'home' })
  }
)
</script>

<template>
  <div v-if="loader.show" class="h-full flex justify-center items-center">
    <AppLoader :message="loader.message" />
  </div>
  <SendTokensPreview
    v-else-if="showPreview"
    :preview-data="{
    senderWalletAddress: userStore.walletAddress,
    recipientWalletAddress: setHexPrefix(recipientWalletAddress),
    amount,
    gasFee: gasFeeInEth,
    selectedToken: selectedToken.symbol as string,
    estimatedGas,
  }"
    @close="showPreview = false"
    @submit="handleSendToken"
  />
  <div v-else class="flex flex-col justify-between">
    <div class="relative flex justify-center items-center">
      <button
        class="absolute left-0"
        title="Click to go back"
        @click.stop="router.go(-1)"
      >
        <img :src="getImage('back-arrow.svg')" class="w-6 h-6" />
      </button>
      <span class="text-lg font-bold">Send Token</span>
    </div>
    <form
      class="flex flex-col flex-grow justify-between mt-8"
      @submit.prevent="handleShowPreview"
    >
      <div class="flex flex-col gap-7">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="recipientWalletAddress">
            Recipient’s Wallet Address
          </label>
          <input
            id="recipientWalletAddress"
            v-model="recipientWalletAddress"
            required
            type="text"
            class="input-field"
            :class="{ 'input-active': isWalletAddressFocused }"
            placeholder="Enter Recipient’s Wallet Address"
            @focus="isWalletAddressFocused = true"
            @blur="isWalletAddressFocused = false"
          />
        </div>
        <div class="flex gap-2">
          <div class="flex flex-col gap-1">
            <label for="amount" class="text-sm font-medium">Amount</label>
            <div
              class="input-field flex"
              :class="{ 'input-active': isAmountFocused }"
            >
              <input
                id="amount"
                v-model="amount"
                autocomplete="off"
                required
                type="text"
                placeholder="0.1"
                @focus="isAmountFocused = true"
                @blur="isAmountFocused = false"
              />
              <button
                class="btn-primary uppercase m-1 px-3 py-2 font-medium text-xs"
                type="button"
                @click.stop="void 0"
              >
                Max
              </button>
            </div>
            <div class="text-gray-100 text-xs font-normal">
              Total Balance:
              <span class="text-black-500 dark:text-white-100"
                >{{ selectedTokenBalance }} {{ selectedToken.symbol }}</span
              >
            </div>
          </div>
          <div class="flex flex-col gap-1 flex-grow">
            <label for="tokens" class="text-sm font-medium">Token</label>
            <div v-if="tokenList.length" class="input-field pt-[1px]">
              <select
                :model-value="selectedToken.symbol"
                name="tokens"
                class="pr-0 mr-[10px] w-full"
                @change="handleTokenChange"
              >
                <option
                  v-for="token in tokenList"
                  :key="token.address"
                  :value="JSON.stringify(token)"
                >
                  {{ token.symbol }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <GasPrice
          v-if="appStore.chainType === ChainType.evm_secp256k1"
          :gas-prices="gasPrices"
          :base-fee="baseFee"
          :gas-limit="estimatedGas"
          @gas-price-input="handleSetGasPrice"
        />
      </div>
      <div class="flex">
        <button
          class="btn-primary uppercase p-[10px] font-bold text-base flex-grow text-center"
        >
          Preview
        </button>
      </div>
    </form>
  </div>
</template>

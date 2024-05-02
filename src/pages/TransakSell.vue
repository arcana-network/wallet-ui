<script setup lang="ts">
import { Decimal } from 'decimal.js'
import { ethers } from 'ethers'
import { computed, onBeforeMount, ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppLoader from '@/components/AppLoader.vue'
import GasPrice from '@/components/GasPrice.vue'
import {
  getChainLogoUrl,
  getEnabledChainList,
} from '@/services/chainlist.service'
import {
  getAppConfig,
  getGaslessEnabledStatus,
} from '@/services/gateway.service'
import { useAppStore } from '@/store/app'
import { useRpcStore } from '@/store/rpc'
import { CreateAccountHandler, EVMAccountHandler } from '@/utils/accountHandler'
import { ChainType } from '@/utils/chainType'
import { getImage } from '@/utils/getImage'
import {
  requestHandlerExists,
  setRequestHandler,
  getRequestHandler,
} from '@/utils/requestHandlerSingleton'
import { initSCW, scwInstance } from '@/utils/scw'
import { initStorage, getStorage } from '@/utils/storageWrapper'
import { truncateMid } from '@/utils/stringUtils'
import {
  fetchTransakNetworks,
  getTransakSellableNetworks,
  getTransakSellableCryptos,
  type TransakNetwork,
} from '@/utils/transak'

const rpcStore = useRpcStore()
const DEFAULT_THEME = 'dark'
const showLoader = ref(true)
const toast = useToast()
const appDetails = ref({})
const route = useRoute()
const appId = route.params.appId as string
const query = computed(() => route.query)
const splitCryptoAmount = computed(() => {
  const amounts =
    (query.value.cryptoAmount as string)?.split('.') || query.value.crypto
  return {
    integer: amounts instanceof Array ? amounts[0] : amounts,
    decimal: amounts instanceof Array ? amounts[1] : undefined,
  }
})
const selectedNetworkName = ref('')
const selectedNetworkLogo = ref('')
const selectedCryptoLogo = ref('')
const selectedCryptoDecimals = ref(0)
const selectedNetworkChainId = ref(0)
const appStore = useAppStore()
const contractAddress = ref('')
const selectedNetworkSymbol = ref('')
const balance = ref('')
const nativeBalance = ref('')
const gas = reactive({
  maxFee: '0',
  maxPriorityFee: '0',
  gasLimit: '0',
  baseFee: '0',
})
const txStatus = reactive({
  success: false,
  failure: false,
  failureReason: 'Something went wrong',
})

const displayGasFees = computed(() => {
  return new Decimal(gas.maxFee)
    .mul(Decimal.pow(10, 9))
    .mul(gas.gasLimit)
    .div(Decimal.pow(10, 18))
    .toDecimalPlaces(6)
})

onBeforeMount(async () => {
  showLoader.value = true
  await fetchTransakNetworks()
  const info = await getAppDetails(appId)
  await setRpcConfigs()
  appDetails.value = info
  const network = getTransakSellableNetworks().find(
    (network) => network.value === query.value.network
  ) as TransakNetwork
  const chainId = network.chainId
  const chain = rpcStore.rpcConfigs?.[chainId]
  populateFields(chain)
  initStorage(appId)
  updateTheme()
  initAccountHandler(chain?.rpcUrls[0])
  await handleGasless(
    chain?.chainId as string,
    appId,
    query.value.partnerCustomerId as string
  )
  await fetchNativeBalance()
  if (contractAddress.value !== ethers.constants.AddressZero) {
    await fetchERC20Balance()
  } else {
    balance.value = nativeBalance.value
  }
  await calculateGas()
  setInterval(() => {
    calculateBaseFee()
  }, 2000)
  postMessage(
    {
      txHash: null,
      provider: 'transak',
      chainId: selectedNetworkChainId.value,
      contractAddress:
        contractAddress.value === ethers.constants.AddressZero
          ? 'NATIVE'
          : contractAddress.value,
      tokenDecimals: selectedCryptoDecimals.value,
      tokenLogo: selectedCryptoLogo.value,
      ...query.value,
    },
    'sell_token_init'
  )
  showLoader.value = false
})

async function fetchNativeBalance() {
  const accountHandler = getRequestHandler().getAccountHandler()
  const balance = (
    await (accountHandler as EVMAccountHandler).provider.getBalance(
      query.value.partnerCustomerId as string
    )
  ).toString()
  nativeBalance.value = new Decimal(balance).div(Decimal.pow(10, 18)).toString()
}

async function fetchERC20Balance() {
  const accountHandler = getRequestHandler().getAccountHandler()
  const tokenBalance = (
    await (accountHandler as EVMAccountHandler).getTokenBalance(
      contractAddress.value,
      query.value.partnerCustomerId as string
    )
  ).toString()
  balance.value = new Decimal(tokenBalance)
    .div(Decimal.pow(10, selectedCryptoDecimals.value))
    .toString()
}

function populateFields(chain) {
  selectedNetworkLogo.value = getChainLogoUrl(chain, 'EVM')
  selectedNetworkChainId.value = Number(chain.chainId)
  selectedNetworkName.value = chain?.chainName || ''
  selectedNetworkSymbol.value = chain?.nativeCurrency?.symbol || 'Unknown'
  const currency = getTransakSellableCryptos().find(
    (crypto) =>
      crypto.network.name === query.value.network &&
      crypto.symbol === query.value.cryptoCurrency
  )
  contractAddress.value = currency.address || ''
  selectedCryptoLogo.value = currency.image.large || ''
  selectedCryptoDecimals.value = currency.decimals
}

async function setRpcConfigs() {
  const { chains } = await getEnabledChainList(appId)
  const enabledChains = chains
    .filter((chain) => {
      if (appStore.chainType === ChainType.solana_cv25519) {
        return chain.compatibility?.toLowerCase() === 'solana'
      } else {
        return chain.compatibility?.toLowerCase() === 'evm'
      }
    })
    .map((chain) => ({
      chainId: chain.chain_id,
      rpcUrls: [chain.rpc_url],
      chainName: chain.name,
      chainType: chain.chain_type,
      blockExplorerUrls: [chain.exp_url],
      isCustom: false,
      nativeCurrency: {
        symbol: chain.currency,
        decimals: 18,
      },
      defaultChain: chain.default_chain,
    }))
  if (!rpcStore.rpcConfigs) rpcStore.setRpcConfigs(enabledChains)
}

function postMessage(response, type = 'sell_token_init') {
  const allowedDomain = window.origin
  try {
    window.parent.opener.postMessage(
      {
        response,
        type,
      },
      allowedDomain
    )
  } catch (e) {
    // Intentionally ignoring errors
  }
}

function updateTheme() {
  const theme = getStorage().local.getThemePreference()
  const htmlEl = document.getElementsByTagName('html')[0]
  htmlEl.classList.add(theme || DEFAULT_THEME)
}

async function getAppDetails(appId: string) {
  const { data } = await getAppConfig(appId)
  return data
}

function initAccountHandler(rpcUrl) {
  const { privateKey } = getStorage().local.getUserInfo()
  if (!requestHandlerExists()) {
    const accountHandler = CreateAccountHandler(privateKey, rpcUrl)
    setRequestHandler(accountHandler)
  }
}

async function handleGasless(chainId: string, appId: string, address: string) {
  let isGaslessEnabled = false
  const chainId_int = Number(chainId)
  try {
    isGaslessEnabled = await (
      await getGaslessEnabledStatus(appId, chainId_int)
    ).data.status
  } catch (e) {
    isGaslessEnabled = false
  } finally {
    rpcStore.setGaslessEnabledStatus(`${chainId_int}`, isGaslessEnabled)
    if (isGaslessEnabled) {
      const isSCW =
        address.toLowerCase() === scwInstance.scwAddress?.toLowercase()
      rpcStore.setPreferredWalletAddressType(isSCW ? 'scw' : 'eoa')
      await initScwSdk()
    }
  }
}

async function initScwSdk() {
  const requestHandler = getRequestHandler()
  const accountHandler = requestHandler.getAccountHandler()
  await initSCW(appId, (accountHandler as EVMAccountHandler).getSigner())
}

function setHexPrefix(value: string) {
  const hexPrefix = '0x'
  return value.startsWith(hexPrefix) ? value : `${hexPrefix}${value}`
}

function closeWindow() {
  window.parent.close()
}

function handleFallbackLogo(event) {
  event.target.src = getImage('blockchain-icon.png')
}

function handleReject() {
  postMessage(
    {
      orderId: query.value.orderId,
      chainId: selectedNetworkChainId.value,
    },
    'sell_token_reject'
  )
  window.parent ? window.parent.close() : window.close()
}

async function calculateBaseFee() {
  const accountHandler = getRequestHandler().getAccountHandler()
  const baseGasPrice = (
    await (accountHandler as EVMAccountHandler).provider.getGasPrice()
  ).toString()
  gas.baseFee = new Decimal(baseGasPrice).div(Decimal.pow(10, 9)).toString()
  if (gas.maxFee === '0') {
    gas.maxFee = gas.baseFee
  }
}

async function calculateGas() {
  const accountHandler = getRequestHandler().getAccountHandler()
  if (appStore.chainType === ChainType.evm_secp256k1) {
    await calculateBaseFee()
    if (contractAddress.value === ethers.constants.AddressZero) {
      try {
        gas.gasLimit = (
          await (accountHandler as EVMAccountHandler).provider.estimateGas({
            from: query.value.partnerCustomerId as string,
            to: query.value.walletAddress as string,
            value: query.value.cryptoAmount as string,
          })
        ).toString()
      } catch (e) {
        gas.gasLimit = '21000' // Estimated for native transfers
      }
    } else {
      try {
        gas.gasLimit = (
          await (accountHandler as EVMAccountHandler).estimateCustomTokenGas(
            contractAddress.value,
            query.value.walletAddress as string,
            new Decimal(query.value.cryptoAmount as string)
              .mul(Decimal.pow(10, selectedCryptoDecimals.value))
              .toHexadecimal()
          )
        ).toString()
      } catch (e) {
        gas.gasLimit = '45000' // Estimated for ERC20 transfers
      }
    }
    gas.maxFee = new Decimal(gas.baseFee).toString()
  }
}

async function handleApprove() {
  if (
    contractAddress.value === ethers.constants.AddressZero &&
    new Decimal(balance.value).lessThan(
      Decimal.sub(query.value.cryptoAmount as string, displayGasFees.value)
    )
  ) {
    toast.error(
      `Insufficient ${
        selectedNetworkSymbol.value
      } balance to perform the transaction. Please recharge the wallet with atleast ${new Decimal(
        displayGasFees.value
      ).add(query.value.cryptoAmount as string)} ${
        selectedNetworkSymbol.value
      } and try again.`
    )
    return
  }
  if (new Decimal(balance.value).lessThan(query.value.cryptoAmount as string)) {
    toast.error(
      `Insufficient ${query.value.cryptoCurrency} balance to perform the transaction. Please recharge the wallet with atleast ${query.value.cryptoAmount} ${query.value.cryptoCurrency} and try again.`
    )
    return
  }
  if (new Decimal(nativeBalance.value).lessThan(displayGasFees.value)) {
    toast.error(
      `Insufficient ${
        selectedNetworkSymbol.value
      } balance to pay for gas fees. Please recharge the wallet with atleast ${new Decimal(
        displayGasFees.value
      ).toString()} ${selectedNetworkSymbol.value} and try again.`
    )
    return
  }

  const accountHandler =
    getRequestHandler().getAccountHandler() as EVMAccountHandler

  if (contractAddress.value === ethers.constants.AddressZero) {
    const payload: any = {
      to: setHexPrefix(query.value.walletAddress as string),
      value: new Decimal(query.value.cryptoAmount as string)
        .mul(Decimal.pow(10, 18))
        .toHexadecimal(),
      from: setHexPrefix(query.value.partnerCustomerId as string),
      type: '0x2',
      maxFeePerGas: new Decimal(gas.maxFee)
        .mul(Decimal.pow(10, 9))
        .toHexadecimal(),
      maxPriorityFeePerGas: new Decimal(gas.maxPriorityFee)
        .mul(Decimal.pow(10, 9))
        .toHexadecimal(),
      gasLimit: gas.gasLimit,
    }

    try {
      const txHash = await accountHandler.sendTransaction(
        payload,
        setHexPrefix(query.value.partnerCustomerId as string)
      )
      txStatus.success = true
      postMessage(
        {
          orderId: query.value.orderId as string,
          txHash,
        },
        'sell_token_tx_success'
      )
    } catch (e: any) {
      txStatus.failure = true
      txStatus.failureReason = e.message
      postMessage(
        {
          orderId: query.value.orderId as string,
        },
        'sell_token_tx_failure'
      )
    }
  } else {
    const amount = new Decimal(query.value.cryptoAmount as string)
      .mul(Decimal.pow(10, selectedCryptoDecimals.value))
      .toHexadecimal()
    try {
      const txHash = await accountHandler.sendCustomToken(
        contractAddress.value,
        query.value.walletAddress as string,
        amount,
        new Decimal(gas.maxFee).mul(Decimal.pow(10, 9)).toHexadecimal(),
        gas.gasLimit
      )
      txStatus.success = true
      postMessage(
        {
          orderId: query.value.orderId as string,
          txHash,
        },
        'sell_token_tx_success'
      )
    } catch (e: any) {
      txStatus.failure = true
      txStatus.failureReason = e.message
      postMessage(
        {
          orderId: query.value.orderId as string,
        },
        'sell_token_tx_failure'
      )
    }
  }
}

function handleGasPriceInput(data) {
  gas.gasLimit = data.gasLimit
  gas.maxFee = data.maxFeePerGas
  gas.maxPriorityFee = data.maxPriorityFeePerGas
}

function tryAgain() {
  txStatus.success = false
  txStatus.failure = false
  txStatus.failureReason = ''
}
</script>

<template>
  <div v-if="showLoader" class="flex-1 flex justify-center">
    <AppLoader message="Please wait..." />
  </div>
  <div v-else class="flex flex-col gap-5 items-center justify-center">
    <div
      class="border border-solid border-[#363636] bg-[#1f1f1f] font-bold text-[16px] rounded-md px-4 py-5 max-w-[360px] w-full flex items-center justify-center"
    >
      Sell Crypto
    </div>
    <div
      v-if="txStatus.success"
      class="border border-solid border-[#363636] bg-[#1f1f1f] rounded-md p-4 max-w-[360px] w-full flex flex-col gap-3 items-center justify-center"
    >
      <div
        class="bg-[#141414] min-h-[50vh] rounded-md w-full flex flex-col flex-grow justify-center items-center gap-5"
      >
        <img src="@/assets/images/success.svg" class="h-[60px] w-[60px]" />
        <div class="flex flex-col gap-3 items-center text-center">
          <span class="font-bold">Transaction Approved</span>
          <span class="text-[#8d8d8d] text-[12px] mx-5"
            >The transaction was completed. Please click below to view the
            transaction on the explorer.</span
          >
        </div>
        <div class="flex flex-col gap-3 flex-wrap items-center">
          <a class="text-[14px] flex items-center gap-1"
            >View Order on Transak
            <img :src="getImage('external-link.svg')" class="h-4 w-4"
          /></a>
          <a class="text-[14px] flex items-center gap-1"
            >View Transaction on Explorer
            <img :src="getImage('external-link.svg')" class="h-4 w-4"
          /></a>
        </div>
        <button class="text-[12px]" @click.stop="closeWindow">
          Close Window
        </button>
      </div>
    </div>
    <div
      v-else-if="txStatus.failure"
      class="border border-solid border-[#363636] bg-[#1f1f1f] rounded-md p-4 max-w-[360px] w-full flex flex-col gap-3 items-center justify-center"
    >
      <div
        class="bg-[#141414] min-h-[50vh] w-full rounded-md flex flex-col flex-grow justify-center items-center gap-5"
      >
        <img src="@/assets/images/failed.svg" class="h-[60px] w-[60px]" />
        <div class="flex flex-col gap-3 items-center text-center">
          <span class="font-bold">Transaction Failed</span>
          <span class="text-[#8d8d8d] text-[12px] mx-5"
            >The transaction was failed. Retry again.</span
          >
          <span class="text-[12px]"
            ><span class="font-bold">Reason: </span
            ><span class="text-[#8d8d8d]">{{
              txStatus.failureReason
            }}</span></span
          >
        </div>
        <div class="flex gap-5 justify-between flex-wrap items-center">
          <button class="text-[12px]" @click.stop="tryAgain">Try Again</button>
          <button class="text-[12px]" @click.stop="closeWindow">
            Close Window
          </button>
        </div>
      </div>
    </div>
    <div
      v-else
      class="border border-solid border-[#363636] bg-[#1f1f1f] rounded-md px-4 py-5 max-w-[360px] w-full flex flex-col gap-3"
    >
      <div class="flex items-baseline gap-4 justify-center">
        <div class="flex items-center gap-2">
          <img
            :src="selectedCryptoLogo"
            class="h-5 w-5"
            @error="handleFallbackLogo"
          />
          <p class="text-[20px]">{{ query.cryptoCurrency }}</p>
        </div>
        <p>
          <span class="text-[40px]">{{ splitCryptoAmount.integer }}</span
          ><span v-if="splitCryptoAmount.decimal" class="text-[20px]"
            >.{{ splitCryptoAmount.decimal }}</span
          >
        </p>
      </div>
      <div class="bg-[#141414] rounded-sm p-4 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <span class="text-[12px]">Wallet:</span>
          <span
            class="text-[15px] font[500]"
            :title="(route.query.partnerCustomerId as string)"
            >{{ truncateMid(route.query.partnerCustomerId as string, 5) }}
            <span class="text-[10px]">{{
              rpcStore.preferredAddressType === 'scw'
                ? '(Smart Wallet)'
                : '(User Wallet)'
            }}</span></span
          >
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[12px]">Fiat Amount:</span>
          <span class="text-[15px] font[500]"
            >{{ query.fiatAmount }} {{ query.fiatCurrency }}</span
          >
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[12px]">Transak Fees:</span>
          <span class="text-[15px] font[500]"
            >{{ query.totalFeeInFiat }} {{ query.fiatCurrency }}</span
          >
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[12px]">Network:</span>
          <div class="flex items-center gap-2">
            <img
              v-if="selectedNetworkLogo"
              :src="selectedNetworkLogo"
              class="h-5 w-5"
              :alt="selectedNetworkName"
              @error="handleFallbackLogo"
            />
            <span class="text-[15px] font[500]">{{
              selectedNetworkName || query.network
            }}</span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[12px]">Token Balance:</span>
          <span class="text-[15px] font[500]"
            >{{ balance }} {{ route.query.cryptoCurrency }}</span
          >
        </div>
        <div
          v-if="contractAddress !== ethers.constants.AddressZero"
          class="flex items-center justify-between"
        >
          <span class="text-[12px]">Gas Balance:</span>
          <span class="text-[15px] font[500]"
            >{{ nativeBalance }} {{ selectedNetworkSymbol }}</span
          >
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[12px]">Transaction Fees:</span>
          <span class="text-[15px] font[500]"
            >{{ displayGasFees }} {{ selectedNetworkSymbol }}</span
          >
        </div>
      </div>
      <div>
        <GasPrice
          :base-fee="gas.baseFee"
          :gas-limit="gas.gasLimit"
          :max-fee-per-gas="gas.maxFee"
          :max-priority-fee-per-gas="gas.maxPriorityFee"
          @gas-price-input="handleGasPriceInput"
        />
      </div>
      <div class="flex gap-4 mt-4">
        <button
          class="btn-secondary h-10 p-2 uppercase w-full text-sm font-bold"
          @click.stop="handleReject"
        >
          Reject
        </button>
        <button
          class="btn-primary h-10 p-2 uppercase w-full text-sm font-bold"
          @click.stop="handleApprove"
        >
          Approve
        </button>
      </div>
    </div>
  </div>
</template>

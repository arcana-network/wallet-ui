<script setup lang="ts">
import { onBeforeMount, reactive, ref, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'

import AppLoader from '@/components/AppLoader.vue'
import { NFT } from '@/models/NFT'
import AddOrEditNFTScreen from '@/pages/AddOrEditNFTScreen.vue'
import { NFTDB } from '@/services/nft.service'
import { useAppStore } from '@/store/app'
import { useModalStore } from '@/store/modal'
import { useRpcStore } from '@/store/rpc'
import { useUserStore } from '@/store/user'
import { getImage } from '@/utils/getImage'
import { getStorage } from '@/utils/storageWrapper'
import { useSVGInjector } from '@/utils/useSvgInjector.ts'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const router = useRouter()
const userStore = useUserStore()
const rpcStore = useRpcStore()
const modalStore = useModalStore()
const appStore = useAppStore()
const showModal = ref(false)
const modalToShow: Ref<'add' | 'edit'> = ref('add')
const editModalParams = ref({
  address: '',
  collectionName: '',
  tokenId: '',
})

const loader = reactive({
  show: false,
  message: '',
})
const storage = getStorage()

let nftDB: NFTDB
const nfts: Ref<NFT[]> = ref([])

onBeforeMount(async () => {
  nftDB = await NFTDB.create(storage.local, userStore.walletAddress)
  nfts.value = nftDB.getNFTs(Number(rpcStore.selectedChainId))
})

function handleAddToken() {
  modalStore.setShowModal(true)
  showModal.value = true
  modalToShow.value = 'add'
  editModalParams.value = {
    address: '',
    collectionName: '',
    tokenId: '',
  }
}

function handleEditToken(nft: NFT) {
  // if (!nft.autodetected) {
  modalStore.setShowModal(true)
  showModal.value = true
  modalToShow.value = 'edit'
  editModalParams.value = {
    address: nft.address,
    collectionName: nft.collectionName,
    tokenId: nft.tokenId,
  }
  // }
}

watch(
  () => modalStore.show,
  async () => {
    if (!modalStore.show) {
      showModal.value = false
      loader.show = true
      loader.message = 'Loading NFTs...'
      nftDB = await NFTDB.create(storage.local, userStore.walletAddress)
      nfts.value = nftDB.getNFTs(Number(rpcStore.selectedChainId))
      loader.show = false
    }
  }
)

watch(
  () => rpcStore.selectedChainId,
  () => {
    nfts.value = nftDB.getNFTs(Number(rpcStore.selectedChainId))
  }
)

function truncateNFTTokenId(tokenId: string) {
  return tokenId.length > 24
    ? `${tokenId.slice(0, 6)}...${tokenId.slice(-6)}`
    : tokenId
}

const backContainer = ref<HTMLElement | null>(null)
const plusContainer = ref<HTMLElement | null>(null)

const svgRefs = [backContainer, plusContainer]

const { fetchAndInjectSVG } = useSVGInjector(svgRefs)
</script>

<template>
  <div v-if="loader.show" class="flex justify-center items-center flex-1">
    <AppLoader :message="loader.message" />
  </div>
  <div v-else class="flex-grow mb-5">
    <div class="flex flex-1 flex-col min-h-full">
      <div class="flex flex-col items-center min-h-full flex-grow gap-5">
        <div class="relative flex justify-center items-center w-full">
          <button
            class="absolute left-0"
            title="Click to go back"
            @click.stop="router.go(-1)"
          >
            <div ref="backContainer">
              <img
                :src="getImage('back-arrow.svg')"
                class="w-6 h-6"
                alt="Back Icon"
                @load="(event) => fetchAndInjectSVG(event, 0)"
              />
            </div>
          </button>
          <span class="font-Nohemi text-[20px] font-medium">Manage NFTs</span>
        </div>
        <div
          class="card flex flex-col w-full h-full max-h-max text-left flex-grow overflow-hidden"
        >
          <div
            v-if="nfts.length"
            class="flex flex-col flex-grow overflow-y-scroll py-2"
          >
            <div
              v-for="nft in nfts"
              :key="`nft-${nft.address}-${nft.tokenId}`"
              :title="`${nft.collectionName} (${nft.tokenId}) - ${nft.name}`"
              class="select-none flex justify-between text-base px-4 py-2 nft-container"
              :class="{
                'cursor-pointer': !nft.autodetected,
              }"
              @click.stop="handleEditToken(nft)"
            >
              <span
                class="overflow-hidden whitespace-nowrap"
                :class="
                  getFontSizeStyle(Number(appStore.theme_settings.font_size))
                "
                :style="{
                  fontFamily: getFontFaimly(
                    appStore.theme_settings.font_pairing
                  ).primaryFontClass,
                  color: appStore.theme_settings.font_color,
                }"
              >
                {{ nft.collectionName }} ({{ truncateNFTTokenId(nft.tokenId) }})
              </span>
              <img :src="getImage('edit.svg')" class="opacity-0" />
            </div>
          </div>
          <div v-else class="flex flex-col flex-grow">
            <span
              class="m-auto"
              :class="
                getFontSizeStyle(Number(appStore.theme_settings.font_size))
              "
              :style="{
                fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                  .primaryFontClass,
                color: appStore.theme_settings.font_color,
              }"
              >No NFTs added</span
            >
          </div>
        </div>
        <button
          class="btn-quaternery flex w-full space-x-1 items-center cursor-pointer justify-center"
          :style="{
            borderColor: appStore.theme_settings.accent_color,
          }"
          @click.stop="handleAddToken"
        >
          <div ref="plusContainer">
            <img
              :src="getImage('plus.svg')"
              alt="Plus Icon"
              @load="(event) => fetchAndInjectSVG(event, 1)"
            />
          </div>

          <span
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.accent_color,
            }"
            >New</span
          >
        </button>
      </div>
    </div>
    <Teleport v-if="modalStore.show" to="#modal-container">
      <AddOrEditNFTScreen
        v-if="showModal"
        :edit="modalToShow === 'edit'"
        :collection-name="editModalParams.collectionName"
        :address="editModalParams.address"
        :token-id="editModalParams.tokenId"
      />
    </Teleport>
  </div>
</template>

<style>
.nft-container:hover img {
  opacity: 1;
}
</style>

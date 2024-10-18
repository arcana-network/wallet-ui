<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import AppLoader from '@/components/AppLoader.vue'
import { useAppStore } from '@/store/app'
import { getImage } from '@/utils/getImage'
import { getStorage } from '@/utils/storageWrapper'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const emit = defineEmits(['close'])
const router = useRouter()
const storage = getStorage()
const isLoading = ref(false)
const appStore = useAppStore()
function handleProceed() {
  router.push({ name: 'home' })
  emit('close')
  storage.session.clearMnemonic()
}
</script>

<template>
  <div>
    <AppLoader v-if="isLoading" message="Processing..." />
    <div v-else class="card-secondary flex flex-col py-6 px-3">
      <div class="flex flex-col gap-3">
        <img
          src="@/assets/images/success-new.svg"
          alt="success"
          class="h-12 w-12 mx-auto"
        />
        <div class="flex flex-col">
          <p
            class="text-center"
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
          >
            Done
          </p>
          <p
            :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
            :style="{
              fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
                .primaryFontClass,
              color: appStore.theme_settings.font_color,
            }"
          >
            Great! You can now use this seed phrase to import your account into
            another wallet app anytime you like.
          </p>
        </div>
      </div>
      <form class="flex flex-col mt-5 space-y-4">
        <button
          class="flex-1 btn-primary py-[10px]"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
            borderColor: appStore.theme_settings.accent_color,
            backgroundColor: appStore.theme_settings.accent_color,
          }"
          @click.stop="handleProceed()"
        >
          Proceed
        </button>
      </form>
    </div>
    <div class="flex space-x-1 justify-center items-center pt-6">
      <span
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
        >Powered by</span
      >
      <img :src="getImage('arcana-logo.svg')" alt="arcana" class="h-3" />
    </div>
  </div>
</template>

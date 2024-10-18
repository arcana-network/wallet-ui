<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

import { useAppStore } from '@/store/app'
import { content, errors } from '@/utils/content'
import { getImage } from '@/utils/getImage'
import { getFontFaimly, getFontSizeStyle } from '@/utils/utilsFunction'

const emit = defineEmits(['proceed', 'back', 'switch-alternate'])

const password = ref('')
const passwordType = ref('password')
const toast = useToast()
const appStore = useAppStore()
function handleProceed() {
  if (!password.value) return toast.error(content.PIN)
  emit('proceed', {
    password: password.value,
  })
}
</script>

<template>
  <div class="px-4 py-2">
    <div class="flex gap-2 items-center mb-5">
      <button title="Click to go back" @click.stop="emit('back')">
        <img
          src="@/assets/images/arrow-white.svg"
          class="-rotate-90 invert dark:invert-0"
        />
      </button>
      <div
        class="modal-title"
        :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
        :style="{
          fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
            .primaryFontClass,
          color: appStore.theme_settings.font_color,
        }"
      >
        Recovery PIN
      </div>
    </div>
    <form class="flex flex-col gap-4" @submit.prevent="handleProceed">
      <div class="flex flex-col gap-1">
        <label
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
          }"
          >Type in the PIN used during setup</label
        >
        <div class="relative">
          <input
            v-model.trim="password"
            :type="passwordType"
            class="text-sm p-3 input-field text-ellipsis overflow-hidden whitespace-nowrap w-full focus:input-active bg-gray-zinc dark:bg-black-arsenic"
            placeholder="Enter a alphanumberic pin"
          />
          <img
            v-if="passwordType === 'password'"
            :src="getImage('eye.svg')"
            class="absolute top-[50%] right-3 w-4 cursor-pointer"
            style="transform: translateY(-50%)"
            title="Show password"
            @click.stop="passwordType = 'text'"
          />
          <img
            v-else
            :src="getImage('eye-off.svg')"
            class="absolute top-[50%] right-3 w-4 cursor-pointer"
            style="transform: translateY(-50%)"
            title="Hide password"
            @click.stop="passwordType = 'password'"
          />
        </div>
      </div>
      <div class="flex flex-col mt-1 justify-center items-center gap-4">
        <button
          class="mt-1 text-sm btn-primary p-2 w-48"
          type="submit"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
            borderColor: appStore.theme_settings.accent_color,
            backgroundColor: appStore.theme_settings.accent_color,
          }"
        >
          Proceed
        </button>
        <button
          class="font-medium capitalize text-sm btn-tertiary"
          :class="getFontSizeStyle(Number(appStore.theme_settings.font_size))"
          :style="{
            fontFamily: getFontFaimly(appStore.theme_settings.font_pairing)
              .primaryFontClass,
            color: appStore.theme_settings.font_color,
            borderColor: appStore.theme_settings.accent_color,
            backgroundColor: appStore.theme_settings.accent_color,
          }"
          @click.stop="emit('switch-alternate')"
        >
          Answer Security Questions Instead
        </button>
      </div>
    </form>
  </div>
</template>

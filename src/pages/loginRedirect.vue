<script setup lang="ts">
import { SecretSharing, utils as KeyShareUtils } from '@arcana/key-helper'
import { BN } from 'bn.js'
import {
  encryptWithPublicKey,
  decryptWithPrivateKey,
  Encrypted,
} from 'eth-crypto'
import { Wallet } from 'ethers'
import { getUniqueId } from 'json-rpc-engine'
import { connectToParent } from 'penpal'
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

import type { RedirectParentConnectionApi } from '@/models/Connection'
import { getNonce, getMetadata, setMetadata } from '@/services/metadata.service'
import { getAuthProvider } from '@/utils/getAuthProvider'
import {
  handlePasswordlessLogin,
  handlePasswordlessLoginV2,
  handleSocialLogin,
} from '@/utils/redirectUtils'
import { toHex } from '@/utils/toHex'

const route = useRoute()
const { appId } = route.params

let channel: BroadcastChannel | null = null

onMounted(init)
onUnmounted(cleanup)

async function init() {
  const parentAppUrl = localStorage.getItem('parentAppUrl')
  // TODO: Fix this V, throw error n stuff
  if (!parentAppUrl) {
    return
  }
  try {
    const connectionToParent =
      await connectToParent<RedirectParentConnectionApi>({}).promise
    const authProvider = await getAuthProvider(`${appId}`)
    if (authProvider.isLoggedIn()) {
      const info = authProvider.getUserInfo()
      const userInfo = {
        userInfo: info.userInfo,
        loginType: info.loginType,
        privateKey: '',
      }
      const sss = new SecretSharing(3, 2)
      const dkgShare = new BN(info.privateKey, 16)
      const locallyStoredEncryptedShare =
        localStorage.getItem(`encrypted-share`)
      if (locallyStoredEncryptedShare) {
        const decryptedShare = await decryptWithPrivateKey(
          dkgShare.toString(16),
          JSON.parse(locallyStoredEncryptedShare) as Encrypted
        )
        const privateKey = sss.combine([
          [new BN(1), dkgShare],
          [new BN(2), new BN(decryptedShare, 16)],
        ])
        const wallet = new Wallet(toHex(privateKey.toString(16)))
        const dkgWallet = new Wallet(toHex(dkgShare.toString(16)))
        const nonce = (await getNonce(dkgWallet.address)).data
        const signature = await dkgWallet.signMessage(String(nonce))
        const metadata = (
          await getMetadata({
            address: dkgWallet.address,
            signature,
            appAddress: String(appId),
          })
        ).data
        const addressInMetadata = metadata.metadata.address
        if (addressInMetadata === wallet.address) {
          userInfo.privateKey = wallet.privateKey.replace('0x', '')
        } else {
          throw new Error('Invalid shares found')
        }
      } else {
        const randomShare = KeyShareUtils.randomNumber()
        const privateKey = sss.combine([
          [new BN(1), dkgShare],
          [new BN(2), randomShare],
        ])
        const wallet = new Wallet(toHex(privateKey.toString(16)))
        const dkgWallet = new Wallet(toHex(dkgShare.toString(16)))
        const nonce = (await getNonce(dkgWallet.address)).data
        const encryptedShare = await encryptWithPublicKey(
          dkgWallet.publicKey.replace('0x', ''),
          randomShare.toString(16)
        )

        const signature = await dkgWallet.signMessage(
          JSON.stringify({
            address: wallet.address,
            encryptedShare: {
              index: 2,
              value: JSON.stringify(encryptedShare),
            },
            nonce: Number(nonce),
          })
        )

        await setMetadata({
          address: dkgWallet.address,
          signature,
          metadata: {
            address: wallet.address,
            encryptedShare: {
              index: 2,
              value: JSON.stringify(encryptedShare),
            },
          },
          appAddress: String(appId),
        })
        userInfo.privateKey = wallet.privateKey.replace('0x', '')
        localStorage.setItem(`encrypted-share`, JSON.stringify(encryptedShare))
      }
      sessionStorage.setItem('userInfo', JSON.stringify(userInfo))
      sessionStorage.setItem('isLoggedIn', JSON.stringify(true))
      const messageId = getUniqueId()
      if (info.loginType === 'passwordless') {
        await handlePasswordlessLoginV2(info, connectionToParent).catch(
          async () => {
            channel = new BroadcastChannel(`${appId}_login_notification`)
            await handlePasswordlessLogin(
              info,
              messageId,
              parentAppUrl,
              connectionToParent,
              channel
            )
          }
        )
      } else {
        await handleSocialLogin(
          info,
          messageId,
          parentAppUrl,
          connectionToParent
        )
      }
    } else {
      await reportError('Could not login, please try again', parentAppUrl)
      return
    }
  } catch (e) {
    if (e instanceof Error) {
      await reportError(e.message, parentAppUrl)
    }
  }
}

function cleanup() {
  if (channel) {
    channel.close()
  }
}
async function reportError(errorMessage: string, parentUrl: string) {
  const connectionToParent = await connectToParent<RedirectParentConnectionApi>(
    {}
  ).promise
  await connectionToParent.error(errorMessage, parentUrl)
  return
}
</script>

<template>
  <div>Please wait...</div>
</template>

import { defineStore } from 'pinia'

type ModalStoreState = {
  show: boolean
}

export const useModalStore = defineStore('modalStore', {
  state: () =>
    ({
      show: false,
    } as ModalStoreState),

  actions: {
    setShowModal(show: boolean): void {
      this.show = show
    },
  },
})

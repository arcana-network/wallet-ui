import { defineStore } from 'pinia'

import { getExchangeRate } from '@/services/exchangeRate.service'

const supportedCurrencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
  CHF: '₣',
  RUB: '₽',
}

const useCurrencyStore = defineStore('currencies', {
  state: () => ({
    currencies: {} as any,
    selectedCurrency: '',
  }),
  getters: {
    getCurrencySymbol(state) {
      return supportedCurrencySymbols[state.selectedCurrency] || '$'
    },
  },
  actions: {
    setLocalCurrencyCode() {
      const currencyCode = 'USD'
      if (currencyCode && supportedCurrencySymbols[currencyCode]) {
        this.selectedCurrency = currencyCode
      }
    },
    async fetchAndSetExchangeRates() {
      const exchangeDump = await getExchangeRate(this.selectedCurrency)
      this.currencies = exchangeDump
    },
  },
})

export default useCurrencyStore

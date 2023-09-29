import { defineStore } from 'pinia'

import { getExchangeRate } from '@/services/exchangeRate.service'

const supportedCurrencySymbols = {
  USD: 'US$',
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

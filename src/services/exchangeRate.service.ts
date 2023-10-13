import axios from 'axios'

async function getExchangeRate(fromCurrencySymbol = 'USD'): Promise<any> {
  const exchangeDump = await axios.get(
    `https://api.coinbase.com/v2/exchange-rates?currency=${fromCurrencySymbol}`
  )
  return exchangeDump.data.data.rates
}

export { getExchangeRate }

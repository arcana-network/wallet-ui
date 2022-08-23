import axios from 'axios'

const URL = 'https://api.coinbase.com/v2/exchange-rates'

const service = axios.create({
  baseURL: URL,
})

function getExchangeRate(currencySymbol: string) {
  return service.get('', { params: { currency: currencySymbol } })
}

export { getExchangeRate }

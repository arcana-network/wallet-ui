import axios from 'axios'

const URL = 'https://api.coinbase.com/v2/exchange-rates'

const service = axios.create({
  baseURL: URL,
})

async function getExchangeRate(
  fromCurrencySymbol: string,
  toCurrencySymbol: string
) {
  const {
    data: { data },
  } = await service.get('', { params: { currency: fromCurrencySymbol } })
  return data.rates[toCurrencySymbol]
}

export { getExchangeRate }

import axios, { AxiosError } from 'axios'

const URL = 'https://api.coinbase.com/v2/exchange-rates'
const TOO_MANY_REQUESTS_CODE = 429

const service = axios.create({
  baseURL: URL,
})

async function getExchangeRate(
  fromCurrencySymbol: string,
  toCurrencySymbol: string
) {
  try {
    const {
      data: { data },
    } = await service.get('', { params: { currency: fromCurrencySymbol } })
    return data.rates[toCurrencySymbol]
  } catch (err: AxiosError) {
    if (err.response.status === TOO_MANY_REQUESTS_CODE) {
      return null
    } else {
      throw err
    }
  }
}

export { getExchangeRate }

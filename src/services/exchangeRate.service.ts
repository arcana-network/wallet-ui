import axios from 'axios'

type CurrencySymbol = 'BTC' | 'USD' | 'ETH' | 'XAR' | 'MATIC'

const URL = 'https://api.coinbase.com/v2/exchange-rates'
const TOO_MANY_REQUESTS_CODE = 429

const service = axios.create({
  baseURL: URL,
})

async function getExchangeRate(
  fromCurrencySymbol: CurrencySymbol,
  toCurrencySymbol: CurrencySymbol
): Promise<number | null> {
  try {
    const {
      data: { data },
    } = await service.get('', { params: { currency: fromCurrencySymbol } })
    return data.rates[toCurrencySymbol]
  } catch (err) {
    if (
      axios.isAxiosError(err) &&
      err.response &&
      err.response.status === TOO_MANY_REQUESTS_CODE
    ) {
      return null
    } else {
      throw err
    }
  }
}

export type { CurrencySymbol }
export { getExchangeRate }

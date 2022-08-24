import axios from 'axios'

const URL = 'https://ethgasstation.info/api/ethgasAPI.json'

const service = axios.create({
  baseURL: URL,
})

async function getGasPrice() {
  const {
    data: { fast },
  } = await service.get('')
  return fast
}

export { getGasPrice }

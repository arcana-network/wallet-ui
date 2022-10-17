import axios from 'axios'

const EthGasStationApi = 'https://ethgasstation.info/api/ethgasAPI.json'
const PolygonGasStationApi = 'https://gasstation-mainnet.matic.network/v2'
const PolygonMumbaiGasStationApi = 'https://gasstation-mumbai.matic.today/v2'

const POLYGON_CHAIN_IDS = [137, 80001]
const GAS_AVAILABLE_CHAIN_IDS = [1, 5, ...POLYGON_CHAIN_IDS]

const GasApiMapping = {
  1: {
    api: EthGasStationApi,
  },
  5: {
    api: EthGasStationApi,
  },
  137: {
    api: PolygonGasStationApi,
  },
  80001: {
    api: PolygonMumbaiGasStationApi,
  },
}

function convertPolygonResponseToEthResponse(data) {
  return {
    fast: data.fast.maxFee * 10,
    safeLow: data.safeLow.maxFee * 10,
    average: data.standard.maxFee * 10,
    fastWait: 0.08,
    safeLowWait: 0.5,
    avgWait: 0.25,
  }
}

async function getGasPrice(chainId = 1) {
  const gasStationUrl = GasApiMapping[chainId].api
  const { data } = await axios.get(gasStationUrl)

  if (POLYGON_CHAIN_IDS.includes(chainId)) {
    return convertPolygonResponseToEthResponse(data)
  }

  return data
}

export { getGasPrice, GAS_AVAILABLE_CHAIN_IDS }

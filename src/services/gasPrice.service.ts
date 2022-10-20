import axios from 'axios'

const ETH_GAS_STATION_API = 'https://ethgasstation.info/api/ethgasAPI.json'
const POLYGON_GAS_STATION_API = 'https://gasstation-mainnet.matic.network/v2'
const POLYGON_MUMBAI_GAS_STATION_API =
  'https://gasstation-mumbai.matic.today/v2'

const POLYGON_CHAIN_IDS = [137, 80001]
const GAS_AVAILABLE_CHAIN_IDS = [1, ...POLYGON_CHAIN_IDS]

const GAS_API_MAPPING = {
  1: ETH_GAS_STATION_API,
  137: POLYGON_GAS_STATION_API,
  80001: POLYGON_MUMBAI_GAS_STATION_API,
}

function convertPolygonResponseToEthResponse(data) {
  return {
    fast: Number((data.fast.maxFee * 10).toFixed(9)),
    safeLow: Number((data.safeLow.maxFee * 10).toFixed(9)),
    average: Number((data.standard.maxFee * 10).toFixed(9)),
    fastWait: 0.08,
    safeLowWait: 0.5,
    avgWait: 0.25,
  }
}

async function getGasPrice(chainId = 1) {
  const gasStationUrl = GAS_API_MAPPING[chainId]
  const { data } = await axios.get(gasStationUrl)

  if (POLYGON_CHAIN_IDS.includes(chainId)) {
    return convertPolygonResponseToEthResponse(data)
  }

  return data
}

export { getGasPrice, GAS_AVAILABLE_CHAIN_IDS }

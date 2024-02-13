import axios from 'axios'

async function getMVXNfts(address): Promise<any> {
  const { data } = await axios.get(address)
  return data
}

export { getMVXNfts }

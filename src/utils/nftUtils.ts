import { ethers } from 'ethers'

import erc1155abi from '@/abis/erc1155.abi.json'
import erc721abi from '@/abis/erc721.abi.json'
import { getAccountHandler } from '@/utils/accountHandler'

type ContractParams = {
  tokenId: string
  contractAddress: string
}

async function checkERCStandard(address) {
  const accountHandler = getAccountHandler()
  const provider = accountHandler.provider

  const ERC165Abi = [
    {
      inputs: [
        {
          internalType: 'bytes4',
          name: 'interfaceId',
          type: 'bytes4',
        },
      ],
      name: 'supportsInterface',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ]

  const ERC1155InterfaceId = '0xd9b67a26'
  const ERC721InterfaceId = '0x80ac58cd'

  const contract = new ethers.Contract(address, ERC165Abi, provider)

  if (await contract.supportsInterface(ERC721InterfaceId)) return 721
  else if (await contract.supportsInterface(ERC1155InterfaceId)) return 1155
}

async function checkOwner(data: ContractParams): Promise<string> {
  const accountHandler = getAccountHandler()
  const ethersContract = new ethers.Contract(
    data.contractAddress,
    erc721abi,
    accountHandler.provider
  )

  const tokenURI = await ethersContract.tokenURI(data.tokenId)
  console.log({ tokenURI })

  return ''
}

export { checkOwner }

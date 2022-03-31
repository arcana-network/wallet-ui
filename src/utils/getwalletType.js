import { ethers } from "ethers";

const getContract = (rpcUrl, appAddress) => {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  return new ethers.Contract(
    appAddress,
    ["function walletType() view returns (uint)"],
    provider
  );
};

const getAppAddress = async (id) => {
  const addressResponse = await fetch(
    `${process.env.WALLET_GATEWAY}/get-address/?id=${id}`
  );
  return (await addressResponse.json()).address;
};

export const getWalletType = async (
  appId,
  rpcUrl = process.env.WALLET_RPCURL
) => {
  const appAddress = await getAppAddress(appId);
  if (!appAddress) {
    console.log("App address not found");
    return null;
  }
  const contract = getContract(rpcUrl, appAddress);
  try {
    const res = await contract.functions.walletType();
    return res[0].toNumber();
  } catch (e) {
    console.log({ e });
    return null;
  }
};

import { DID } from "dids";
import { ThreeIdConnect, EthereumAuthProvider } from "@3id/connect";
import { Address } from "wagmi";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { getResolver as get3IDResolver } from '@ceramicnetwork/3id-did-resolver'

export const connect3ID = async (address: Address, provider: any, ceramicClient: CeramicClient) => {
  const authProvider = new EthereumAuthProvider(provider, address as string);
  const threeIdConnect = new ThreeIdConnect("mainnet");
  try {
    await threeIdConnect.connect(authProvider);
  } catch (err) {
    console.error('ThreeIDConnect failure', err)
  }

  // Workaround: Getting a type error with the did resolver
  const resolver = get3IDResolver(ceramicClient)
  const did = new DID({
    provider: threeIdConnect.getDidProvider(),
    // @ts-ignore
    resolver: resolver,
  });
  try {
    await did.authenticate();
  } catch (err) {
    console.error('Ceramic authentication error', err)
  }
  ceramicClient.setDID(did);

  return { authProvider, didProvider: did, did: did.id };
};

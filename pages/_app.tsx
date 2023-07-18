import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import {
  mainnet,
} from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { Did3Provider } from "../contexts/did3Context";
import { Analytics } from '@vercel/analytics/react';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "Disco @ eiffel",
  projectId: process.env.NEXT_PUBLIC_WC_KEY as string,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Did3Provider
          autoConnectDid3={false}
          autoReconnectDid3={false}
          autoDisconnectDid3
        >
          <Component {...pageProps} />
          <Analytics />
        </Did3Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;

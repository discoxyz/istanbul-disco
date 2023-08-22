"use client";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { FC, PropsWithChildren } from "react";

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

export const WalletProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        {/* <Did3Provider
          autoConnectDid3={false}
          autoReconnectDid3={false}
          autoDisconnectDid3
        >
          <ClaimProvider> */}
        {/* <Nav /> */}
        {children}
        {/* </ClaimProvider> */}
        {/* </Did3Provider> */}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

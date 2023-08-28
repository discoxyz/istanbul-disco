"use client";
import React from "react";
import "../styles/globals.scss";
import "@rainbow-me/rainbowkit/styles.css";
// import { Metadata } from "next";
import { WalletProvider } from "../contexts/walletProvider";
import { UserProvider } from "../contexts/userProvider";
import { Footer } from "../components/v2/footer";
import { Nav } from "../components/v2/nav";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <UserProvider />
          <div className="flex h-screen flex-col justify-between">
            <Nav />
            {children}
            <Footer />
          </div>
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  );
}

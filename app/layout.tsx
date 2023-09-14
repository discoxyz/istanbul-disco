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
import { ToastError } from "../components/v2/toast";

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
          {process.env.NEXT_PUBLIC_API_DOWNTIME && (
            <div className='fixed left-0 right-0 bottom-0 flex justify-center'>
              <ToastError text="We are experiencing API downtime, so claiming has been disabled. Please check back later." />
            </div>
          )}
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  );
}

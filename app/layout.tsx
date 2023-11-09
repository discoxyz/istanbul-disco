"use client";
import React from "react";
import "../styles/globals.scss";
import "@rainbow-me/rainbowkit/styles.css";
// import { Metadata } from "next";
import { WalletProvider } from "../contexts/walletProvider";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "../contexts/authProvider";
import { Footer } from "../components/footer";
import { Nav } from "../components/nav";
import { ShareModal } from "../components/shareModal";
import { ModalProvider } from "../contexts/modalProvider";
import { EnsoPopover } from "../components/ensoPopover";

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-200  dark:bg-zinc-900">
        <WalletProvider>
          <AuthProvider>
            <ModalProvider>
              <div className="flex min-h-screen flex-col px-5 py-6">
                <Nav />
                {children}
                <Footer />
              </div>
              <EnsoPopover />
            </ModalProvider>
          </AuthProvider>
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  );
}

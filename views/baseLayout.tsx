"use client";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { WalletProvider } from "../contexts/walletProvider";
import { AuthProvider } from "../contexts/authProvider";
import { Footer } from "../components/footer";
import { Nav } from "../components/nav";
import { FC, PropsWithChildren } from "react";
import { ModalProvider } from "../contexts/modalProvider";

export const BaseLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <UserProvider profileUrl="/api/auth/me" loginUrl="/api/auth/login">
      <WalletProvider>
        <AuthProvider>
          <ModalProvider>
            <div className="flex min-h-screen flex-col px-4 py-6">
              <Nav />
              {children}
              <Footer />
            </div>
          </ModalProvider>
        </AuthProvider>
      </WalletProvider>
    </UserProvider>
  );
};

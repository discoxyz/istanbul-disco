"use client";
import { useAccount } from "wagmi";
import { FC, PropsWithChildren, useEffect } from "react";

export const UserProvider: FC<PropsWithChildren> = ({ children }) => {
  const { isConnected, address } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      const createUser = async () => {
        await fetch("/api/v2/user/create", {
          method: "POST",
          body: JSON.stringify({
            address: address
          }),
        });
      };
      createUser();
    }
  }, [isConnected, address]);

  return <>{children}</>;
};

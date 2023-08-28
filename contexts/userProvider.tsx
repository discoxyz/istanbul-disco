"use client";
import { useAccount } from "wagmi";
import { FC, PropsWithChildren, useEffect } from "react";
import va from "@vercel/analytics";

export const UserProvider: FC<PropsWithChildren> = ({ children }) => {
  const { isConnected, address } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      const createUser = async () => {
        const res = await fetch("/api/v2/user/create", {
          method: "POST",
          body: JSON.stringify({
            address: address,
          }),
        });
        const user: {
          data: {
            existing: boolean;
          };
        } = await res.json();
        const existing = user?.data?.existing;
        va.track("connect", { existing });
      };
      createUser();
    }
  }, [isConnected, address]);

  return <>{children}</>;
};

"use client";
import { useParams, useRouter, usePathname } from "next/navigation";
// import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Address, useAccount } from "wagmi";
import { useAuth } from "../contexts/authProvider";
import { Button2 } from "../components/button";
import { Card } from "../components/card";
import { Credential } from "../components/credCard";
import { useShareModal } from "../contexts/modalProvider";
import { truncateAddress } from "../lib/truncateAddress";
import { compare } from "../lib/compare";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";

export const DropView = () => {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { authenticated, authenticate, address, loading, awaitingAuth } =
    useAuth();
  const { open } = useShareModal();
  const pathname = usePathname();
  if (!pathname) throw new Error("Page must have a pathname");
  const parsedPath = (
    typeof pathname === "string" ? pathname : pathname[0]
  ).replaceAll("/", "");

  const [hasClaimed, setHasClaimed] = useState({
    claiming: false,
    loading: true,
    claimed: false,
  });

  useEffect(() => {
    const handler = async () => {
      if (!address || !parsedPath) {
        setHasClaimed({
          claiming: false,
          claimed: false,
          loading: false,
        });
        return;
      }
      setHasClaimed({
        claiming: false,
        claimed: false,
        loading: true,
      });

      const response = await fetch("/api/istanbul/getClaimStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner: parsedPath,
          claimant: address,
        }),
      });
      const res = await response.json();
      setHasClaimed({
        claiming: false,
        loading: false,
        claimed: res.claimed,
      });
    };
    handler();
  }, [parsedPath, address]);

  const claim = useCallback(
    async (args?: { address: string }) => {
      const handler = async () => {
        const claimant = args?.address || address;
        if (!claimant || !parsedPath) return;
        setHasClaimed({
          claimed: false,
          claiming: true,
          loading: false,
        });
        await fetch("/api/istanbul/claim", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            owner: parsedPath,
            claimant,
          }),
        });
        setHasClaimed({
          claimed: true,
          claiming: false,
          loading: false,
        });
      };
      handler();
    },
    [parsedPath, address],
  );

  const handleSignInClaim = useCallback(() => {
    authenticate({
      onSuccess: async ({ address }) => claim({ address }),
    });
  }, [authenticate, claim]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasClaimed.loading && !loading) setIsLoading(false);
  }, [hasClaimed.loading, loading]);

  return (
    <div>
      <main className="mx-auto mb-auto w-full">
        <Credential
          image={undefined}
          title={"We met IRL"}
          textColor={undefined}
          data={JSON.parse("{}")}
          className="col-span-5 mb-6 sm:col-span-3 md:col-span-2"
          createdByAddress={parsedPath}
        />
        {address && compare(address, parsedPath) ? (
          <Card className="mb-2 grid grid-cols-1 gap-4">
            <h1 className="text-xl font-medium text-black dark:text-white">
              Share your link
            </h1>
            <p className="text-xl text-black dark:text-white/80">
              Invite others to claim that they met you using your link:
            </p>
            <Button2
              variant="primary"
              loading={hasClaimed.loading}
              onClick={open}
            >
              {"Share your claim link"}
            </Button2>
          </Card>
        ) : !hasClaimed.claimed || !authenticated ? (
          <Card className={`mb-2 grid grid-cols-1 gap-4`}>
            <h1 className="text-xl font-medium text-black dark:text-white">
              Claim their credential
            </h1>
            <p className="text-xl text-black dark:text-white/80">
              Claim your credential and share your own to participate in the
              enso leaderboard
            </p>
            {isLoading ? (
              <Button2
                variant="primary"
                disabled
                loading
                onClick={() => claim()}
                className="w-full"
              >
                Loading
              </Button2>
            ) : authenticated ? (
              <Button2
                variant="primary"
                onClick={() => claim()}
                className="w-full"
                loading={hasClaimed.claiming}
                disabled={hasClaimed.claiming}
              >
                {hasClaimed.claiming
                  ? "Claiming"
                  : hasClaimed.loading || loading
                  ? "Loading"
                  : authenticated && "Claim"}
              </Button2>
            ) : !isConnected && !authenticated ? (
              <Button2
                onClick={() => openConnectModal && openConnectModal()}
                className="ml-auto w-full"
                variant={"primary"}
              >
                Connect Wallet
              </Button2>
            ) : (
              <>
                <Button2
                  onClick={() => openAccountModal && openAccountModal()}
                  className="w-full opacity-60"
                  disabled
                  variant={"secondary"}
                >
                  Wallet connected
                </Button2>
                <Button2
                  className="w-full"
                  onClick={handleSignInClaim}
                  loading={awaitingAuth}
                  disabled={awaitingAuth}
                >
                  {awaitingAuth ? "Awaiting Signature" : "Sign in"}
                </Button2>
              </>
            )}
          </Card>
        ) : (
          <Card className="mb-2 grid grid-cols-1 gap-4">
            <h1 className="text-xl font-medium text-black dark:text-white">
              You met {truncateAddress(parsedPath as Address)}
            </h1>
            <p className="text-xl text-black dark:text-white/80">
              Invite them and others to claim that they met you using your link:
            </p>
            <Button2
              variant="primary"
              loading={hasClaimed.loading}
              onClick={open}
            >
              {"Share your own claim link"}
            </Button2>
          </Card>
        )}
      </main>
    </div>
  );
};

"use client";
import { useParams, useRouter, usePathname, redirect } from "next/navigation";
// import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Address, useAccount, usePublicClient } from "wagmi";
import { useAuth } from "../contexts/authProvider";
import { Button2 } from "../components/button";
import { Card } from "../components/card";
import { Credential } from "../components/credCard";
import { useShareModal } from "../contexts/modalProvider";
import { truncateAddress } from "../lib/truncateAddress";
import { compare } from "../lib/compare";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { getEnsAddress, getEnsName } from "viem/ens";
import Link from "next/link";

export const DropView = () => {
  const { isConnected } = useAccount();
  const router = useRouter();
  const publicClient = usePublicClient();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { authenticated, authenticate, address, loading, awaitingAuth } =
    useAuth();
  const { open } = useShareModal();
  const pathname = usePathname();

  const ethAddressRegex = new RegExp(/^0x[A-Fa-f0-9]{40}$/);
  const ensRegex = new RegExp(
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
  );

  // if (!_ethAddr && !ensAddr) {
  //   router.push("/");
  //   return;
  // }
  const [profile, setProfile] = useState<{
    loading: boolean;
    name?: string;
    address?: string;
  }>({
    loading: true,
  });

  useEffect(() => {
    const handler = async () => {
      if (!publicClient) return;
      if (!pathname) throw new Error("Page must have a pathname");
      const parsedPath = (
        typeof pathname === "string" ? pathname : pathname[0]
      ).replaceAll("/", "");

      const _ethAddr = ethAddressRegex.exec(parsedPath);
      const ensAddr = ensRegex.exec(parsedPath);
      if (_ethAddr) {
        setProfile({
          loading: false,
          name: truncateAddress(_ethAddr[0] as Address) as string,
          address: _ethAddr[0],
        });
        return;
      }

      if (ensAddr) {
        const ens = await getEnsAddress(publicClient, { name: ensAddr[0] });
        if (ens) {
          setProfile({
            loading: false,
            name: ensAddr[0],
            address: ens,
          });
          return;
        }
      }
      // router.push("/");
    };
    handler();
  }, [publicClient, pathname]);

  const [hasClaimed, setHasClaimed] = useState({
    claiming: false,
    loading: true,
    claimed: false,
  });

  useEffect(() => {
    const handler = async () => {
      if (!profile.address || !address) {
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
          owner: profile.address,
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
  }, [profile.address, address]);

  const claim = useCallback(
    async (args?: { address: string }) => {
      const handler = async () => {
        const claimant = args?.address || address;
        if (!claimant || !profile.address) return;
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
            owner: profile.address,
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
    [profile, address],
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
          createdByAddress={profile.name || undefined}
        />
        {address && profile.address && compare(address, profile.address) ? (
          <Card className="mb-2 grid grid-cols-1 gap-3">
            <h1 className="text-lg font-medium text-black dark:text-white">
              Share your link
            </h1>
            <p className="text-lg text-black dark:text-white/80">
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
          <Card className={`mb-2 grid grid-cols-1 gap-3`}>
            <h1 className="text-lg font-medium text-black dark:text-white">
              Claim that you met {profile.name}
            </h1>
            {/* <p className="text-lg text-black dark:text-white/80">
              Did you meet? Claim your credential and ask them to claim yours.
            </p> */}
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
          <Card className="mb-2 grid grid-cols-1 gap-3">
            <h1 className="text-lg font-medium text-black dark:text-white">
              You met {profile.name}
            </h1>
            {/* <p className="text-lg text-black dark:text-white/80">
              
            </p> */}
            <Button2
              variant="primary"
              loading={hasClaimed.loading}
              onClick={open}
            >
              Make things mutual
            </Button2>
            {!hasClaimed.loading && (
              <Link href="/" className="w-full">
                <Button2
                  variant="secondary"
                  className="w-full"
                  // loading={hasClaimed.loading}
                >
                 View my rolodex (size matters)
                </Button2>
              </Link>
            )}
          </Card>
        )}
      </main>
    </div>
  );
};

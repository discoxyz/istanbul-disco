"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Credential } from "../../../components/v2/credCard";
import { Address, useAccount, useSignMessage } from "wagmi";
import { sign } from "crypto";
import { Key, useCallback, useEffect, useState } from "react";
import { Prisma } from "@prisma/client";
import { Nav } from "../../../components/v2/nav";
import { getDrops } from "../../services/getDrops";
import { DropRow } from "../../../components/v2/dropRow";
import Link from "next/link";
import { Button } from "../../../components/v2/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseClaimStatus } from "../../../lib/parseClaimStatus";
import {
  ToastError,
  ToastLoading,
  ToastSuccess,
} from "../../../components/v2/toast";

// This gets called on every request

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const { signMessageAsync } = useSignMessage();
  const { address, isConnected } = useAccount();
  const path = params?.path as string;
  const [drop, setDrop] =
    useState<Prisma.DropGetPayload<{ include: { claims?: true } }>>();
  const [eligible, setEligible] = useState<boolean | undefined>();
  const [claimed, setClaimed] = useState<boolean | undefined>();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [justClaimed, setJustClaimed] = useState<boolean>(false);

  useEffect(() => {
    if (path) {
      const fetchDrops = async () => {
        setLoaded(false);
        const drops = await getDrops({
          path,
          address: address || undefined,
          withClaims: !!address || undefined,
          withClaimsBy: address || undefined,
        });
        setDrop(drops[0] || []);
        setLoaded(true);
      };
      fetchDrops();
    }
  }, [path, address]);

  useEffect(() => {
    // const claim = drop.claims?.filter((c) => c.address == address)[0];
    if (drop) {
      const { claimed, eligible } = parseClaimStatus(drop, address);
      setClaimed(claimed);
      setEligible(eligible);
    } else {
      setClaimed(undefined);
      setEligible(undefined);
    }
  }, [drop, address]);

  const claim = useCallback(async () => {
    setClaiming(true);
    const message = `I am claiming my credential`;
    const signature = await signMessageAsync({ message: message });

    const claim = await fetch(`/api/v2/claims/claimDrop/${drop?.id}`, {
      method: "POST",
      body: JSON.stringify({
        claimingAddress: address,
        signature,
        message,
        dropId: drop?.id,
      }),
    });

    const res = await claim.json();
    if (!claim.ok) {
      setClaiming(false);
      setError(res.message || "Something went wrong when claiming");
      return;
    }
    setClaiming(false);
    setClaimed(true);
    setJustClaimed(true);
  }, [signMessageAsync, drop, address]);

  const [created, setCreated] = useState(false);
  const searchParams = useSearchParams();
  useEffect(() => {
    setCreated(!!searchParams?.get("created"));
  }, [searchParams]);

  const [ClaimArea, setClaimArea] = useState<JSX.Element>(
    <>
      <h1 className="text-xl">Not Connected</h1>
      <ConnectButton />
    </>,
  );

  useEffect(() => {
    if (!isConnected) {
      setClaimArea(
        <>
          <h1 className="text-xl">Not Connected</h1>
          <ConnectButton />
        </>,
      );
    } else if (claimed) {
      setClaimArea(<h1 className="text-xl">You claimed this</h1>);
    } else if (eligible) {
      setClaimArea(
        <>
          <h1 className="text-xl">Drop not claimed</h1>
          <Button onClick={claim}>Claim</Button>
        </>,
      );
    } else setClaimArea(<h1 className="text-xl">Not eligible</h1>);
  }, [isConnected, claimed, eligible]);

  return (
    <div>
      <main className="mx-auto mb-auto w-full max-w-4xl px-6">
        <nav className="text-base mb-6 flex h-16 w-full items-center px-6 text-white/60 md:text-lg lg:text-2xl">
          <Link href="/" className="mr-2 lg:mr-5">Active Drops</Link>
          <span className="mx-2 opacity-60 mr-2 lg:mr-5">/</span>
          <span className="opacity-60 mr-auto">{drop?.name}</span>
          {drop && isConnected && address === drop?.createdByAddress && (
            <Link
              href={`/my-drops/${path}/manage`}
              className="ml-auto mr-0 underline opacity-60"
            >
              Manage
            </Link>
          )}
        </nav>
        {drop && loaded && (
          <DropRow drop={drop} className="pointer-events-none mb-4" />
        )}
        <div className="rounded-3xl bg-stone-950 p-6">{ClaimArea}</div>
      </main>
      <div className="fixed bottom-0 flex w-full flex-col items-center">
        {error && (
          <ToastError text={error} onDismiss={() => setError(undefined)} />
        )}
        {claiming && <ToastLoading text="Claiming drop" />}
        {justClaimed && (
          <ToastSuccess
            text="Drop claimed"
            onDismiss={() => setClaiming(false)}
          />
        )}
        {created && (
          <ToastSuccess
            text="Drop created"
            onDismiss={() => {
              router.replace(`/active/${path}`);
              setCreated(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Page;

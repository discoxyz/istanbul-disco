"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAccount, useSignMessage } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { Prisma } from "@prisma/client";
import { getDrops } from "../services/getDrops";
import { DropRow } from "../../components/v2/dropRow";
import Link from "next/link";
import { parseClaimStatus } from "../../lib/parseClaimStatus";
import {
  ToastError,
  ToastLoading,
  ToastSuccess,
} from "../../components/v2/toast";
import { ClaimArea } from "../../components/v2/claimArea";
import Head from "next/head";

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

  return (
    <div>
      <Head>
        <meta name="twitter:card" content="summary_large_image" />
        {/* <meta name="twitter:site" content="@nytimes" />
<meta name="twitter:creator" content="@SarahMaslinNir" /> */}
        <meta
          name="twitter:title"
          content="Parade of Fans for Houston’s Funeral"
        />
        <meta
          name="twitter:description"
          content="NEWARK - The guest list and parade of limousines with celebrities emerging from them seemed more suited to a red carpet event in Hollywood or New York than than a gritty stretch of Sussex Avenue near the former site of the James M. Baxter Terrace public housing project here."
        />
        <meta name="twitter:image" content="https://unsplash.it/800" />
      </Head>
      <main className="mx-auto mb-auto w-full max-w-4xl px-6">
        <nav className="mb-6 flex h-16 w-full items-center px-6 text-base text-white/60 md:text-lg lg:text-2xl">
          <Link href="/" className="mr-2 lg:mr-5">
            Active Drops
          </Link>
          <span className="mx-2 mr-2 opacity-60 lg:mr-5">/</span>
          <span className="mr-auto opacity-60">{drop?.name}</span>
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
        {drop && (
          <ClaimArea
            className="mb-2 rounded-3xl bg-stone-950 p-6"
            claimed={!!claimed}
            eligible={!!eligible}
            claim={claim}
            loading={!loaded}
            claiming={claiming}
            drop={drop}
          />
        )}
        {/* <div className="rounded-3xl bg-stone-950 p-6">{ClaimArea}</div> */}
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
              router.replace(`/${path}`);
              setCreated(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Page;
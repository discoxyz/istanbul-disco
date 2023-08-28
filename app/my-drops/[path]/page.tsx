"use client";
import {
  redirect,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useAccount, useSignMessage } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { Prisma } from "@prisma/client";
import { getDrops } from "../../services/getDrops";
import { DropRow } from "../../../components/v2/dropRow";
import Link from "next/link";
import { parseClaimStatus } from "../../../lib/parseClaimStatus";
import {
  ToastError,
  ToastLoading,
  ToastSuccess,
} from "../../../components/v2/toast";
import { ClaimArea } from "../../../components/v2/claimArea";

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
    if (!isConnected) {
      redirect(`/${path}`);
    }
    if (path && address) {
      const fetchDrops = async () => {
        setLoaded(false);
        const drops = await getDrops({
          path,
          address,
          withClaims: true,
          withClaimsBy: address || undefined,
          includeHidden: true,
          includeDisabled: true,
        });
        setDrop(drops[0] || []);
        setLoaded(true);
      };
      fetchDrops();
    }
  }, [path, address, isConnected]);

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
  }, [drop, address, isConnected]);

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
    <div className='mb-auto" w-full'>
      <main className="mx-auto w-full max-w-4xl">
        <nav className="mb-6 flex h-16 w-full items-center px-6 text-2xl">
          <Link href="/my-drops">My Drops</Link>
          <span className="mx-2 opacity-60">/</span>
          <span className="opacity-60">{drop?.name}</span>
          {drop && isConnected && address === drop?.createdByAddress && (
            <Link
              href={`${path}/manage`}
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

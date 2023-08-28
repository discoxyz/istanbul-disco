"use client";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getDrops } from "../../../services/getDrops";
import { redirect, useParams } from "next/navigation";
import { ClaimList } from "../../../../components/v2/claimList";
import { DropForm } from "../../../../components/v2/dropForm";
import { Credential } from "../../../../components/v2/credCard";
import { ToastSuccess } from "../../../../components/v2/toast";
import Link from "next/link";

export default function Page() {
  const params = useParams();
  const path = params?.path as string;
  const { address } = useAccount();
  const [drop, setDrop] = useState<any>();

  const fetchDrop = async (path: string) => {
    const drops = await getDrops({
      path,
      withClaims: true,
      includeHidden: true,
      includeDisabled: true,
    });
    const drop = drops[0];
    setDrop({ ...drop, subjectData: JSON.parse(drop?.subjectData || "{}") });
  };

  useEffect(() => {
    if (path) {
      fetchDrop(path);
    }
  }, [path, address]);

  // Handle redirect if no permission
  useEffect(() => {
    if (path && drop && address !== drop?.createdByAddress) {
      return redirect(`/${path}`);
    }
  }, [drop, address, path]);

  const setDropFn = useCallback(
    (newData: any) => {
      setDrop({ ...drop, ...newData });
    },
    [drop],
  );

  const [copied, setCopied] = useState(false);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
  }

  return (
    <>
      <main className="items-star relative mx-auto mb-auto flex w-full max-w-7xl items-start p-4">
        <div className="mr-12 w-full max-w-3xl text-xl">
          {drop && (
            <DropForm
              drop={drop}
              setDrop={setDropFn}
              refreshData={() => fetchDrop(path)}
            />
          )}
        </div>
        <div className="sticky top-0 flex-1 flex-col">
          {drop && (
            <>
              <h2 className="mb-4 mt-12 flex px-4 text-2xl">
                Credential Preview
              </h2>
              <Credential
                createdByAddress={drop.createdByAddress}
                image={drop.image || undefined}
                title={drop.name}
                schema={drop.schema}
                data={drop?.subjectData}
                {...drop}
              />
            </>
          )}
          <h2 className="mb-4 mt-12 flex px-4 text-2xl">Share link</h2>
          <div className="flex w-full justify-stretch gap-4">
            <button
              onClick={() =>
                handleCopy(
                  `${process.env.NEXT_PUBLIC_VERCEL_URL}/${drop?.path}`,
                )
              }
              className="group flex flex-1 justify-between rounded-lg border border-white/20 bg-zinc-950/50 px-4 py-3 text-base transition-all hover:border-white/40"
            >
              <span className="cursor-text select-text opacity-60 transition-all hover:opacity-100">
                {process.env.NEXT_PUBLIC_VERCEL_URL}/{drop?.path}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6 opacity-60 transition-all group-hover:opacity-100"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                />
              </svg>
            </button>
            <Link
              className="group flex h-12 w-12 items-center rounded-full bg-[#1DA1F2] p-3"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `Claim your ${name} credential at Disco 🪩
${process.env.NEXT_PUBLIC_VERCEL_URL}/${path}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                // xml:space="preserve"
                viewBox="0 0 248 204"
                className="opacity-50 transition-all group-hover:scale-105 group-hover:opacity-100"
              >
                <path
                  fill="#fff"
                  d="M221.95 51.29c.15 2.17.15 4.34.15 6.53 0 66.73-50.8 143.69-143.69 143.69v-.04c-27.44.04-54.31-7.82-77.41-22.64 3.99.48 8 .72 12.02.73 22.74.02 44.83-7.61 62.72-21.66-21.61-.41-40.56-14.5-47.18-35.07 7.57 1.46 15.37 1.16 22.8-.87-23.56-4.76-40.51-25.46-40.51-49.5v-.64c7.02 3.91 14.88 6.08 22.92 6.32C11.58 63.31 4.74 33.79 18.14 10.71c25.64 31.55 63.47 50.73 104.08 52.76-4.07-17.54 1.49-35.92 14.61-48.25 20.34-19.12 52.33-18.14 71.45 2.19 11.31-2.23 22.15-6.38 32.07-12.26-3.77 11.69-11.66 21.62-22.2 27.93 10.01-1.18 19.79-3.86 29-7.95-6.78 10.16-15.32 19.01-25.2 26.16z"
                />
              </svg>
            </Link>
          </div>
          <ClaimList drop={drop} />
        </div>
        {copied && (
          <div className="fixed bottom-0 left-0 right-0 flex justify-center">
            <ToastSuccess
              text="Link copied to clipboard"
              onDismiss={() => setCopied(false)}
            />
          </div>
        )}
      </main>
    </>
  );
}

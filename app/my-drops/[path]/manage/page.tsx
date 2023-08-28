"use client";

import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getDrops } from "../../../services/getDrops";
import { redirect, useParams } from "next/navigation";
import { ClaimList } from "../../../../components/v2/claimList";
import { DropForm } from "../../../../components/v2/dropForm";
import { Credential } from "../../../../components/v2/credCard";
import { ToastSuccess } from "../../../../components/v2/toast";
// import { useRouter } from "next/navigation";
// import { recoverMessageAddress } from "viem";

// const prisma = new PrismaClient();

export default function Page() {
  const params = useParams();
  // const { signMessageAsync } = useSignMessage();
  // const { address, isConnected } = useAccount();
  const path = params?.path as string;
  // const { data, error, isLoading, signMessageAsync, variables } =
  //   useSignMessage();
  const { address } = useAccount();

  // const [fieldData, setFieldData] = useState(fields);
  // const [_drop, _setDrop] = useState<any>();
  const [drop, setDrop] = useState<any>();
  // const [claims, setClaims] = useState<any[]>([]);

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
      <Head>
        <title>My page title</title>
      </Head>
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
            <button className="flex h-12 w-12 rounded-full bg-[#1DA1F2]">
              T
            </button>
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

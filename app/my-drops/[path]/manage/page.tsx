"use client";

import Head from "next/head";
import { Nav } from "../../../../components/v2/nav";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { getDrops } from "../../../services/getDrops";
import { redirect, useParams } from "next/navigation";
import { ClaimList } from "../../../../components/v2/claimList";
import { DropForm } from "../../../../components/v2/dropForm";
import { Credential } from "../../../../components/v2/credCard";
// import { recoverMessageAddress } from "viem";

// const prisma = new PrismaClient();

export default function Page() {
  const params = useParams();
  // const { signMessageAsync } = useSignMessage();
  // const { address, isConnected } = useAccount();
  const path = params?.path as string;
  const { data, error, isLoading, signMessageAsync, variables } =
    useSignMessage();
  const { address, isConnected } = useAccount();

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
    setDrop({ ...drop, subjectData: JSON.parse(drop.subjectData || []) });
  };

  useEffect(() => {
    if (path) {
      fetchDrop(path);
    }
  }, [path, address]);

  // Handle redirect if no permission
  useEffect(() => {
    if (drop && address !== drop?.createdByAddress) {
      return redirect(`/active/${path}`);
    }
  }, [drop, address]);

  const setDropFn = useCallback(
    (newData: any) => {
      setDrop({ ...drop, ...newData });
    },
    [drop]
  );

  return (
    <>
      <Head>
        <title>My page title</title>
      </Head>
      <main className="p-4 w-full max-w-7xl mx-auto flex items-star mb-auto relative items-start">
        <div className="max-w-3xl w-full mr-12 text-xl">
          {drop && <DropForm drop={drop} setDrop={setDropFn} />}
        </div>
        <div className="flex-col flex-1 sticky top-0">
          {drop && (
            <>
              <h2 className="text-2xl px-4 mt-12 mb-4 flex">
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
          <ClaimList drop={drop} />
        </div>
      </main>
    </>
  );
}

"use client";

import Head from "next/head";
import { Nav } from "../../../../components/v2/nav";
import {
  useEffect,
  useState,
} from "react";
import { useAccount, useSignMessage } from "wagmi";
import { getDrops } from "../../../services/getDrops";
import { redirect, useParams } from "next/navigation";
import { ClaimList } from "../../../../components/v2/claimList";
import { DropForm } from "../../../../components/v2/dropForm";
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
  const [drop, setDrop] = useState<any>();
  // const [claims, setClaims] = useState<any[]>([]);

  const fetchDrop = async (path: string) => {
    const drops = await getDrops({ path, withClaims: true });
    const drop = drops[0]
    setDrop(drop);
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
  return (
    <>
      <Head>
        <title>My page title</title>
      </Head>
      <main className=" p-4 w-full max-w-7xl mx-auto flex items-star mb-auto">
        <div className="max-w-2xl w-full mr-12 text-xl">
          {drop && <DropForm drop={drop} />}
        </div>
        <ClaimList drop={drop} />
      </main>
    </>
  );
}

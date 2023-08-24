"use client";

import Head from "next/head";
import { Prisma } from "@prisma/client";
import { Key, useEffect, useState } from "react";
import { DropRow } from "../components/v2/dropRow";
import Link from "next/link";
import { getDrops } from "./services/getDrops";
import { useAccount } from "wagmi";
import { NavTabs } from "../components/navTabs";

export default function Page() {
  const { address, isConnected } = useAccount();
  const [drops, setDrops] = useState<
    Prisma.DropGetPayload<{
      include: {
        claims?: true;
      };
    }>[]
  >();

  useEffect(() => {
    const fetchDrops = async () => {
      const drops = await getDrops({ address });
      setDrops(drops || []);
    };
    fetchDrops();
  }, [address]);

  return (
    <>
      <Head>
        <title>My page title</title>
      </Head>
      <main className="max-w-4xl w-full mx-auto mb-auto px-6">
        <NavTabs />
        {drops?.map((drop, key: Key) => {
          return (
            <Link href={`/active/${drop.path}`} key={key}>
              <DropRow drop={drop} className="mb-4" />
            </Link>
          );
        })}
      </main>
    </>
  );
}

"use client";

import Head from "next/head";
import { Nav } from "../components/v2/nav";
import { Prisma } from "@prisma/client";
import { Key, useEffect, useState } from "react";
import { DropRow } from "../components/v2/dropRow";
import Link from "next/link";
import { getDrops } from "./services/getDrops";
import { useAccount } from "wagmi";

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
      <main className="max-w-4xl w-full mx-auto mb-auto">
        <nav>
          <ol className="flex space-x-5 text-2xl mb-6 px-6 h-16 items-center">
            <li>
              <Link href="/">Active Drops</Link>
            </li>
            {isConnected && (
              <li className="opacity-60">
                <Link href="/my-drops">My Drops</Link>
              </li>
            )}
          </ol>
        </nav>
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

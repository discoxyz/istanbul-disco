"use client";

import Head from "next/head";
import { Nav } from "../../components/v2/nav";
import { Prisma } from "@prisma/client";
import { Key, useEffect, useState } from "react";
import { DropRow } from "../../components/v2/dropRow";
import Link from "next/link";
import { getDrops } from "../services/getDrops";
import { useAccount } from "wagmi";
import { Button } from "../../components/v2/button";
import { redirect } from "next/navigation";
// import { useState } from "react";

// // This gets called on every request
// async function getData() {
//   // Fetch data from external API
//   const res = await fetch(`http://localhost:3000/api/v2/drops/getAll`, {
//     method: "GET",
//   });
//   const data = await res.json();

//   // Pass data to the page via props
//   return { props: { data } };
// }

export default function Page() {
  // const [drops, setDrops] = useState<Prisma.DropGetPayload<{}>[]>([]);

  // const { props } = await getData();
  // const { drops } = props.data.data;
  const { address, isConnected } = useAccount();
  const [drops, setDrops] = useState<any[]>([]);

  useEffect(() => {
    if (!isConnected) {
      redirect('/')
    }
    const fetchDrops = async () => {
      const drops = await getDrops({ createdByAddress: address, address });
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
          <ol className="flex w-full text-2xl mb-6 px-6 h-16 items-center">
            <li className="opacity-60 mr-5">
              <Link href="/">Active Drops</Link>
            </li>
            <li className="mr-5">
              <Link href="/my-drops">My Drops</Link>
            </li>
            
              <li className="ml-auto">
                <Link href="/my-drops/create">
                  <Button>Create</Button>
                </Link>
              </li>
          </ol>
        </nav>
        {drops.map(
          (
            drop: Prisma.DropGetPayload<{ include: { claims: true } }>,
            key: Key
          ) => {
            return (
              <Link href={`/my-drops/${drop.path}`} key={key}>
                <DropRow drop={drop} className="mb-4" />
              </Link>
            );
          }
        )}
      </main>
    </>
  );
}

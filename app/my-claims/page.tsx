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
import { getClaims } from "../services/getClaims";
import { Credential } from "../../components/v2/credCard";
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
  // useEffect(() => {
  //   setCreated(!!searchParams?.get("created"));
  // }, [searchParams]);

  useEffect(() => {
    if (!isConnected || !address) {
      redirect("/");
    }
    const fetchDrops = async () => {
      console.log("getClaims");
      const claims = await getClaims({ address: address, withDrops: true });
      const drops = claims.map((c: any) => c.drop);
      // const drops = false;
      setDrops(drops || []);
    };
    fetchDrops();
  }, [address, isConnected]);

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
            <li className="mr-5 opacity-60">
              <Link href="/my-drops">My Drops</Link>
            </li>
            <li className="mr-5">
              <Link href="/my-claims">My Claims</Link>
            </li>
          </ol>
        </nav>
        <div className="grid grid-cols-3 gap-4">
          {drops.map(
            (
              drop: Prisma.DropGetPayload<{ include: { claims: true } }>,
              key: Key
            ) => {
              return (
                <Link href={`/my-drops/${drop.path}`} key={key}>
                  <Credential
                    image={drop.image || undefined}
                    title={drop.name}
                    data={JSON.parse(drop.subjectData)}
                    className="max-w-sm col-span-2"
                    createdByAddress={drop.createdByAddress}
                    // {...rest}
                  />
                  {/* <DropRow drop={drop} className="mb-4" /> */}
                </Link>
              );
            }
          )}
        </div>
      </main>
    </>
  );
}

"use client";

import { Prisma } from "@prisma/client";
import { Key, useEffect, useState } from "react";
import { DropRow } from "../../components/v2/dropRow";
import Link from "next/link";
import { getDrops } from "../services/getDrops";
import { useAccount } from "wagmi";
import { redirect } from "next/navigation";
import { NavTabs } from "../../components/navTabs";
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
      redirect("/");
    }
    const fetchDrops = async () => {
      const drops = await getDrops({
        createdByAddress: address,
        address,
        includeHidden: true,
        includeDisabled: true,
      });
      setDrops(
        drops.sort((a: any, b: any) =>
          a._count.claims < b._count.claims ? 1 : -1,
        ) || [],
      );
    };
    fetchDrops();
  }, [address, isConnected]);

  return (
    <>
      <main className="mx-auto mb-auto w-full max-w-4xl">
        <NavTabs />
        {drops.map(
          (
            drop: Prisma.DropGetPayload<{
              include: {
                claims: true;
                _count: {
                  select: {
                    claims: true;
                  };
                };
              };
            }>,
            key: Key,
          ) => {
            return (
              <Link href={`/my-drops/${drop.path}`} key={key}>
                <DropRow drop={drop} className="mb-4" />
              </Link>
            );
          },
        )}
      </main>
    </>
  );
}

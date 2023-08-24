"use client";

import Head from "next/head";
import { Nav } from "../../../components/v2/nav";
import { PrismaClient } from "@prisma/client";
import { FC, PropsWithChildren, useCallback, useState } from "react";
import { Credential } from "../../../components/v2/credCard";
import { useAccount, useSignMessage } from "wagmi";
import Link from "next/link";
import { DropForm } from "../../../components/v2/dropForm";
import { schemas } from "../../../lib/schemas";
// import { recoverMessageAddress } from "viem";

// const prisma = new PrismaClient();

export default function Page() {
  const [drop, setDrop] = useState<any>();
  const { address } = useAccount();
  return (
    <>
      <Head>
        <title>My page title</title>
      </Head>
      <main className="max-w-7xl p-4 mx-auto flex items-start mb-auto w-full" >
        <div className="max-w-3xl w-full mr-12 text-xl">
          <DropForm setDrop={setDrop} />
        </div>
        <div className="flex-col flex-1 sticky top-0">
          <>
            <h2 className="text-2xl px-4 mt-12 mb-4 flex">
              Credential Preview
            </h2>
            <Credential
              createdByAddress={address}
              image={ drop?.image || "https://fzt.aqp.mybluehost.me/images/bg_disco.png"}
              title={drop?.name || ""}
              schema={drop?.schema}
              data={drop?.subjectData || {}}
              {...drop}
            />
          </>
        </div>
      </main>
    </>
  );
}

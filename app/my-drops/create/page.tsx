"use client";

import Head from "next/head";
import { useState } from "react";
import { Credential } from "../../../components/v2/credCard";
import { useAccount } from "wagmi";
import { DropForm } from "../../../components/v2/dropForm";
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
      <main className="mx-auto mb-auto flex w-full max-w-7xl items-start p-4">
        <div className="mr-12 w-full max-w-3xl text-xl">
          <DropForm setDrop={setDrop} />
        </div>
        <div className="sticky top-0 flex-1 flex-col">
          <>
            <h2 className="mb-4 mt-12 flex px-4 text-2xl">
              Credential Preview
            </h2>
            <Credential
              createdByAddress={address}
              image={
                drop?.image ||
                "https://fzt.aqp.mybluehost.me/images/bg_disco.png"
              }
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

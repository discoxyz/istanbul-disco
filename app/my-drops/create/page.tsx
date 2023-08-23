"use client";

import Head from "next/head";
import { Nav } from "../../../components/v2/nav";
import { PrismaClient } from "@prisma/client";
import { FC, PropsWithChildren, useCallback, useState } from "react";
import { Credential } from "../../../components/v2/credCard";
import { useAccount, useSignMessage } from "wagmi";
import Link from "next/link";
import { DropForm } from "../../../components/v2/dropForm";
// import { recoverMessageAddress } from "viem";

// const prisma = new PrismaClient();

export default function Page() {

  return (
    <>
      <Head>
        <title>My page title</title>
      </Head>
      <main className="max-w-7xl p-4 mx-auto flex items-start mb-auto w-full">
        <div className="max-w-2xl w-full mr-12 text-xl">
          <DropForm />
        </div>
      </main>
    </>
  );
}

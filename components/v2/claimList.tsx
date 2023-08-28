"use client";

import { Prisma } from "@prisma/client";
import { FC, Key } from "react";
import { Address, useAccount } from "wagmi";
import { truncateAddress } from "../../lib/truncateAddress";

export const ClaimList: FC<{
  drop: Prisma.DropGetPayload<{}> & { claims: Prisma.ClaimGetPayload<{}>[] };
}> = ({ drop }) => {
  const { isConnected, address } = useAccount();
  if (!drop || !isConnected || !address || address !== drop?.createdByAddress) {
    return "Account does not have permission to see claims";
  }
  return (
    <div className="flex-1">
      <h2 className="mb-4 mt-12 flex px-4 text-2xl">
        Claims{" "}
        <span className="ml-2 opacity-60">
          {
            drop?.claims.filter((c: Prisma.ClaimGetPayload<{}>) => c.claimed)
              .length
          }
        </span>
      </h2>
      <div className="rounded-3xl bg-stone-950 p-6">
        <ol>
          {drop.claims.length === 0 && (
            <>
              <h2 className="mt-4 text-center text-2xl">No claims just yet!</h2>
              <p className="mt-2 text-center text-xl opacity-60">
                Be sure to share the link to the drop
              </p>
            </>
          )}
          {drop?.claims
            .filter((c) => c.claimed)
            .map((claim: Prisma.ClaimGetPayload<{}>, key: Key) => {
              return (
                <li
                  key={key}
                  className="flex justify-between border-b border-stone-900 py-3 text-stone-400 last:border-b-0"
                >
                  <p>{truncateAddress(claim.address as Address)}</p>
                  <p>{claim.claimed ? "Claimed" : ""}</p>
                </li>
              );
            })}
        </ol>
      </div>
    </div>
  );
};

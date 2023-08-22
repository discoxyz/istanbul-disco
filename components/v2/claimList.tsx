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
    <div className='flex-1'>
      <h2 className="text-2xl px-4 mt-12 mb-4 flex">
        Claims{" "}
        <span className="opacity-60 ml-2">
          {
            drop?.claims.filter((c: Prisma.ClaimGetPayload<{}>) => c.claimed)
              .length
          }
        </span>
      </h2>
      <div className="bg-stone-950 rounded-3xl p-6">
        <ol>
          {drop.claims.length === 0 && (
            <>
              <h2 className="text-center text-2xl mt-4">No claims just yet!</h2>
              <p className="text-center text-xl mt-2 opacity-60">
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
                  className="py-3 border-b border-stone-900 flex justify-between text-stone-400 last:border-b-0"
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

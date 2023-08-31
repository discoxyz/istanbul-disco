"use client";

import { Prisma } from "@prisma/client";
import { FC, Key, useEffect, useState } from "react";
import { Address, useAccount } from "wagmi";
import { truncateAddress } from "../../lib/truncateAddress";
import { CSVLink } from "react-csv";

export const ClaimList: FC<{
  drop: Prisma.DropGetPayload<{}> & { claims: Prisma.ClaimGetPayload<{}>[] };
}> = ({ drop }) => {
  const { isConnected, address } = useAccount();

  const [donwloadCsv, setDownloadCsv] = useState([["address"]]);
  const [claims, setClaims] = useState<string[]>([]);

  useEffect(() => {
    const csv = [["address"]];
    const claimArr =
      drop?.claims?.filter((c) => c.claimed).map((c) => c.address) || [];
    setClaims(claimArr);
    claimArr.map((c) => {
      csv.push([c]);
    });
    setDownloadCsv(csv);
  }, [drop]);

  if (!drop || !isConnected || !address || address !== drop?.createdByAddress) {
    return "Account does not have permission to see claims";
  }

  return (
    <div className="flex-1">
      <h2 className="mb-4 mt-12 flex px-4 text-2xl">
        Claims <span className="ml-2 opacity-60">{claims.length}</span>
        {claims.length ? (
          <span className="ml-auto pl-2 opacity-60 hover:opacity-100">
            <CSVLink
              data={donwloadCsv}
              filename={`disco-claims-${drop.path}.csv`}
            >
              Export
            </CSVLink>
          </span>
        ) : ''}
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

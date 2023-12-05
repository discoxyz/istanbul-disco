import { NextRequest, NextResponse } from "next/server";
import { parseId } from "../../../lib/validation";

export async function getClaimStatus(args: {
  owner: string;
  claimant: string;
}): Promise<{ claimed: boolean }> {
  const person1 = parseId(args.owner);
  const person2 = parseId(args.claimant);

  const response = await fetch(`https://api.disco.xyz/v1/credentials/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DISCO_KEY}`,
    },
    body: JSON.stringify({
      conjunction: "and",
      criteria: [
        {
          field: "issuer",
          operator: "=",
          value: process.env.ISSUER_DID,
        },
        {
          field: "vc.credentialSubject.person1",
          operator: "=",
          value: person1,
        },
        {
          field: "vc.credentialSubject.person2",
          operator: "=",
          value: person2,
        },
      ],
      page: 1,
      size: 1,
    }),
  });
  const credentials = await response.json();
  return {
    claimed: !!credentials.length,
  };
}

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const { owner, claimant }: { owner: string; claimant: string } = body;
  const claimStatus = await getClaimStatus({ owner, claimant });
  return NextResponse.json(claimStatus);
};

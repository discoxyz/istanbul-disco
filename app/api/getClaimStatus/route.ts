import { NextRequest, NextResponse } from "next/server";
import { getClaimStatus } from "../../../lib/api/getClaimStatus";

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const { owner, claimant }: { owner: string; claimant: string } = body;
  const claimStatus = await getClaimStatus({ owner, claimant });
  return NextResponse.json(claimStatus);
};

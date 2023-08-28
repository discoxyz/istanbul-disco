import { Prisma } from "@prisma/client";
import { Address } from "viem";

export function parseClaimStatus(
  drop: Prisma.DropGetPayload<{ include: { claims: true } }>,
  address?: Address,
) {

  if (!address || !drop.claims) {
    return {
      claimed: undefined,
      eligible: undefined,
    };
  }
  const claim = drop.claims.find((c) => c.address === address);
  return {
    eligible: !drop.gated || !!claim,
    claimed: claim?.claimed || false,
  };
}

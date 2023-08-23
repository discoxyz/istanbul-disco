import { Address } from "viem";

export async function getDrops(args?: {
  address?: string;
  dropId?: number;
  path?: string;
  withClaims?: boolean;
  withClaimsBy?: Address;
  createdByAddress?: Address;
  includeHidden?: boolean;
  includeDisabled?: boolean;
}) {
  const dropFetch = await fetch(`/api/v2/drops/getAllWithStatus`, {
    method: "POST",
    body: JSON.stringify({
      claimingAddress: args?.address || undefined,
      dropId: args?.dropId || undefined,
      path: args?.path || undefined,
      withClaims: args?.withClaims || undefined,
      createdByAddress: args?.createdByAddress || undefined,
      withClaimsBy: args?.address || undefined,
      includeHidden: args?.includeHidden || undefined,
      includeDisabled: args?.includeDisabled || undefined,
      // claimedBy: args?.address || undefined
    }),
  });

  const drop = await dropFetch.json();

  return drop.data.drops || [];
}

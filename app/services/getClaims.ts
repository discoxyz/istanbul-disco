export async function getClaims(args?: {
  address: string;
  dropId?: number;
  withDrops?: boolean;
}) {
  const dropFetch = await fetch(`/api/v2/claims/getClaims`, {
    method: "POST",
    body: JSON.stringify({
      address: args?.address,
      withDrops: true,
      // claimedBy: args?.address || undefined
    }),
  });

  const drop = await dropFetch.json();

  return drop.data.drops || [];
}

async function getDrop(path: string, address?: string) {
  // Fetch data from external API
  let claimed = undefined;
  const dropFetch = await fetch(
    `http://localhost:3000/api/v2/drops/getByPath/${path}`,
    {
      method: "GET",
    }
  );
  const drop = await dropFetch.json();
  if (address && drop.data.drop.id) {
    const claimFetch = await fetch(
      `http://localhost:3000/api/v2/claims/getClaims`,
      {
        method: "POST",
        body: JSON.stringify({
          address: address,
          dropId: drop.data.drop.id,
        }),
      }
    );
    const claim = await claimFetch.json();
    claimed = claim.data.drops[0].claimed || false;
  }

  return {
    drop: drop.data.drop,
    claimed: claimed,
  };
}

export const getStatus = async (
  dropId: number,
  dropPath: string,
  userAddress: string,
) => {
  const getStatus = await fetch("/api/v2/checkout/getStatus", {
    method: "POST",
    body: JSON.stringify({
      dropId: dropId,
      dropPath: dropPath,
      userAddress: userAddress,
    }),
  });

  const res = await getStatus.json();
  return res;
};

export const getPathAvailability: (
  path: string
) => Promise<{ message: string; available: boolean }> = async (path) => {
  const dropFetch = await fetch(`/api/v2/drops/pathAvailable/${path}`, {
    method: "GET",
  });
  const data = await dropFetch.json();
  return data;
};

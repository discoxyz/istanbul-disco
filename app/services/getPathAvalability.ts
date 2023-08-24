import { SetStateAction } from "react";
export async function getPathAvailability(
  path: string,
  setLoadedPath: (args: any) => void
) {
  const dropFetch = await fetch(`/api/v2/drops/pathAvailable/${path}`, {
    method: "GET",
  });
  const data = await dropFetch.json();
  setLoadedPath({ path: path, available: data.available });
  return data;
}

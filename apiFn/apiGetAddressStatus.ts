import { StandardRes } from "./types";

// /pages/api/issuCred.tsx

export const apiGetAddressStatus = async (
  address: string,
): Promise<StandardRes & { info?: { did: string; claimed: number[] } }> => {
  try {
    const req = await fetch(`/api/getAddressStatus/${address}`);
    const res = await req.json();
    return {
      success: res.success,
      message: res.message || "No message",
      info: {
        did: res.did,
        claimed: res.claimed,
      },
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed to get DID for ${address}`,
    };
  }
};

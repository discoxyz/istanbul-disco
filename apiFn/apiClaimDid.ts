import { StandardRes } from "./types";

// /pages/api/issuCred.tsx

export const apiClaimDid = async (
  did: string,
  address: string
): Promise<StandardRes & { info?: { did: string; claimed: number[] } }> => {
  try {
    const claim = await fetch(`/api/claimDid`, {
      method: "POST",
      body: JSON.stringify({
        did: did,
        address: address,
      }),
    });
    const json = await claim.json();
    return {
      success: json.success,
      message: json.message || "No message",
      info: {
        did: json.info?.did,
        claimed: json.info?.claimed || []
      },
    };
  } catch (err) {
    return {
      success: false,
      message: "Failed to claim DID",
    };
  }
};

import { StandardRes } from "./types";

// /pages/api/issuCred.tsx

export const apiIssueCred = async (
  did: string,
  address: string
): Promise<StandardRes> => {
  try {
    const claim = await fetch(`/api/issueCred`, {
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
    };
  } catch (err) {
    return {
      success: false,
      message: "Failed to claim credentail",
    };
  }
};

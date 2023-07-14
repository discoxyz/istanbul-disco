import { StandardRes } from "./types";

// /pages/api/issuCred.tsx

export const apiClearStatus = async (
  address: string
): Promise<StandardRes> => {
  try {
    const req = await fetch(`/api/clearStatus`, {
      method: "POST",
      body: address,
    });
    const res = await req.json();
    return {
      success: res.success,
      message: res.message || "No message",
    };
  } catch (err) {
    return {
      success: false,
      message: "Failed to claim credentail",
    };
  }
};

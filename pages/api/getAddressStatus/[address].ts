import { kv } from "@vercel/kv";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const query = req.query;
  const { address } = query;
  if (address) {
    try {
      const result: { did: string; claimed: boolean } | null = await kv.hgetall(
        address as string
      );
      res.status(200).send({
        success: true,
        did: result?.did,
        claimed: result?.claimed,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        success: false,
        did: undefined,
        claimed: undefined,
        error: true,
        message: "Failed to check if DID exists",
      });
    }
  }
};

export default handler;

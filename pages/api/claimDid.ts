import { kv } from "@vercel/kv";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { address, did } = JSON.parse(req.body);
  try {
    const exists = await kv.hexists(address, "did");
    if (!exists) {
      await kv.hset(address, { did: did, claimed: [] });
      res.status(200).send({
        success: true,
        message: `${did} added to ${address}`,
        info: {
          did: did,
          claimed: [],
        },
      });
    } else {
      const result = await kv.hgetall(address);
      res.status(500).send({
        success: false,
        message: `${did} already added to ${address}`,
        info: {
          did: result?.did,
          claimed: result?.claimed,
        },
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: `Failed to add ${did} to ${address}`,
    });
  }
};

export default handler;

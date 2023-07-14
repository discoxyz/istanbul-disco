import { kv } from "@vercel/kv";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const address = req.body;
  try {
    await kv.del(address);
    console.log('DELETED')
    res.status(200).send({
      success: true,
      message: `${address} removed successfully`,
    });
    res.status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: `${address} not removed`,
    });
    res.status(500);
  }
};

export default handler;

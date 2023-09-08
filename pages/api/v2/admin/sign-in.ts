import { NextApiRequest, NextApiResponse } from "next";
import { recoverMessageAddress } from "viem";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { signature }: { signature: string } = JSON.parse(req.body);

  console.log(signature)
  const recoveredAddress = await recoverMessageAddress({
    message: "I am authenticating",
    signature: signature as `0x${string}`,
  });


  const admin = process.env.ADMIN_ADDRESS?.split(',')

  if (!admin?.includes(recoveredAddress)) {
    res.status(400).send({
      message: "Not authenticated",
      authenticated: false,
    });
    return;
  }

  res.status(200).send({
    message: "Authenticated",
    authenticated: true,
  });
};

export default handler;

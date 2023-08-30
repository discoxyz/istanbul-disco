import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { recoverMessageAddress } from "viem";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { signature, dropId }: { signature: string; dropId: number } =
    JSON.parse(req.body);

  const recoveredAddress = await recoverMessageAddress({
    message: `Delete drop ID ${dropId}`,
    signature: signature as `0x${string}`,
  });

  if (recoveredAddress != process.env.ADMIN_ADDRESS) {
    res.status(400).send({
      message: "Not authenticated",
      deleted: false,
    });
    return;
  }

  try {
    await prisma.drop.delete({
      where: {
        id: dropId,
      },
    });
  } catch {
    res.status(500).send({
      message: "Error occurred. The drop my not have been deleted",
      deleted: false
    });
  }

  res.status(200).send({
    message: "Authenticated",
    deleted: true,
  });
};

export default handler;

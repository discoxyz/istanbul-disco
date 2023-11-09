import { Prisma, PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import { Address, Signature, isAddress, verifyMessage } from "viem";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  
  const { signature, issuer }: Prisma.DropGetPayload<{}> = JSON.parse(req.body);

  const message = `I am creating my drop. ${issuer}`;

  try {
    await verifyMessage({
      address: issuer as Address,
      message,
      signature: signature as `0x${string}`,
    });
  } catch {
    throw new Error("Signature invalid");
  }

  try {
    await prisma.drop.create({
      data: {
        path: crypto.randomBytes(20).toString("hex"),
        signature,
        issuer,
      },
    });
  } catch {
    throw new Error("Unable to create drop");
  }
};

export default handler;

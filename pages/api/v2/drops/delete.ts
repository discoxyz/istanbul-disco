import { PrismaClient, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Address, recoverMessageAddress } from "viem";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    id,
    deleteMessage,
    signature,
    createdByAddress,
  }: {
    id: number;
    signature: string;
    deleteMessage: string;
    createdByAddress: Address;
  } = JSON.parse(req.body);

  // Verify that the data matches the provided signature
  const recoveredAddress = await recoverMessageAddress({
    message: JSON.stringify(deleteMessage),
    signature: signature as `0x${string}`,
  });

  if (createdByAddress !== recoveredAddress) {
    res.status(400).send({
      message: `Signagure does not match address provided or data. The data was signed by ${recoveredAddress} but you provided ${createdByAddress}`,
    });
  }

  // Verify that the address matches the previous signature
  const previousDrop = await prisma.drop.delete({
    where: {
      id: id,
    },
  });

  if (previousDrop.createdByAddress !== createdByAddress) {
    res.status(400).send({
      message: `The address that created this drop does not match the one that you are attempting to delete it with.`,
    });
  }

  // ❤️ ❤️ ❤️
  // YASS LESSGO
  // ❤️ ❤️ ❤️

  try {
    const dropResult = await prisma.drop.delete({
      where: {
        id: id,
      },
    });

    res.status(200).send({
      message:
        "🗑️🗑️🗑️  Drop deleted. Users may still use their claimed credentials. 🗑️🗑️🗑️",
      data: {
        dropResult,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500);
  }
};

export default handler;

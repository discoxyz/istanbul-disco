import { PrismaClient, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { address: _address } = req.query;

  if (!_address) {
    throw Error("No id provided");
  }

  try {
    const address = typeof _address === "string" ? _address : _address[0];
    const drops = await prisma.drop.findMany({
      where: {
        createdByAddress: address,
      },
    });

    res.status(200).send({
      message: `${drops.length} drops found`,
      data: {
        drops,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Something went wrong when finding the drop",
      data: [],
    });
  }
};

export default handler;

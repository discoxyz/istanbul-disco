import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const drops = await prisma.drop.count();
    const users = await prisma.user.count();
    const claims = await prisma.claim.count();

    res.status(200).send({
      message: "Counts fetched",
      data: {
        drops,
        users,
        claims,
      },
    });
  } catch {
    res.status(500).send({
      message: "Error occurred",
    });
  }
};

export default handler;

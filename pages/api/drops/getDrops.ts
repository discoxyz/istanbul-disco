import { PrismaClient, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  try {
    const result = await prisma.drop.findMany();
    res.status(200).send({
      message: `${result.length} drops found`,
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Failed to find drops",
      data: [],
    });
  }
};

export default handler;

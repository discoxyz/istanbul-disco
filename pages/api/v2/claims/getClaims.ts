import { PrismaClient, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { address, dropId }: { address: string,dropId?: number } = JSON.parse(req.body);
  
  try {
    const drops = await prisma.claim.findMany({
      where: {
        address: address,
        dropId: dropId
      },
    });


    res.status(200).send({
      message: `${drops.length} claims found`,
      data: {
        drops,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Something went wrong when finding the claims",
      data: [],
    });
  }
};

export default handler;


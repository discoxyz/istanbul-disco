import { PrismaClient, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { dropId }: { dropId: number } = JSON.parse(req.body);

  try {
    if (!dropId) throw Error();
    const result = await prisma.claim.findMany({
      where: {
        dropId: dropId,
      },
      select: {
        address: true,
        claimed: true,
      },
    });
    res.status(200).send({
      message: `${result.length} claims found`,
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

import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const drops = await prisma.drop.count();
    const users = await prisma.user.count();
    const claims = await prisma.claim.count();

    const dropList = await prisma.drop.findMany({
      orderBy: {
        claims: {
          _count: "desc",
        },
      },
      where: {},
      select: {
        createdByAddress: true,
        id: true,
        name: true,
        path: true,
        _count: {
          select: {
            claims: true,
          },
        },
      },
    });

    const dropCreators: {[key: string]: number} = {};

    dropList.map((d) => {
      const v = dropCreators[d.createdByAddress] || 0
      dropCreators[d.createdByAddress] = v + d._count.claims
    });

    res.status(200).send({
      message: "Counts fetched",
      data: {
        drops,
        users,
        claims,
        dropList,
        dropCreators,
      },
    });
  } catch {
    res.status(500).send({
      message: "Error occurred",
    });
  }
};

export default handler;

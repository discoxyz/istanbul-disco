import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { path: _path } = req.query;

  if (!_path) {
    throw Error("No id provided");
  }

  try {
    const path = typeof _path === "string" ? _path : _path[0];
    const count = await prisma.drop.count({
      where: {
        path,
      },
    });

    res.status(200).send({
      message: "Paths checked",
      available: count === 0 ? true : false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Something went wrong when finding the drop",
    });
  }
};

export default handler;

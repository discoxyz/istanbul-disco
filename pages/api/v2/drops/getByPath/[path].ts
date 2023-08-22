import { PrismaClient, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { path: _path } = req.query;

  if (!_path) {
    throw Error("No id provided");
  }

  try {
    const path = typeof _path === "string" ? _path : _path[0];
    const drop = await prisma.drop.findUnique({
      where: {
        path,
      },
    });

    if (!drop) {
      res.status(400).send({
        message: "Drop with the given path has not been found",
      });
      return
    }

    res.status(200).send({
      message: `Drop found`,
      data: {
        drop,
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

import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id: _id } = req.query;

  if (!_id) {
    throw Error("No id provided");
  }

  try {
    const id = parseInt(typeof _id === "string" ? _id : _id[0]);
    const drop = await prisma.drop.findUnique({
      where: {
        id,
      },
    });

    if (!drop) {
      res.status(400).send({
        message: "Drop with the given ID has not been found",
      });
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

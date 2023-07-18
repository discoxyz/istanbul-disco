import { PrismaClient, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { path } = req.query;
  if (path) {
    try {
      const result = await prisma.drop.findUnique({
        where: { path: path as string },
      });
      if (result) {
        res.status(200).send({
          message: `Drop found`,
          data: {
            ...result,
            subjectData: JSON.parse(result.subjectData),
          },
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        message: "Failed to find drops",
        data: [],
      });
    }
  } else {
    res.status(400).send({
      message: "No drop ID in path",
      data: [],
    });
  }
};

export default handler;

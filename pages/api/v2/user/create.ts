import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { address }: { address: string } = JSON.parse(req.body);
  try {
    let user;
    let existing = true
    user = await prisma.user.findUnique({
      where: {
        address,
      },
    });

    if (!user) {
      existing = false
      user = await prisma.user.create({
        data: {
          address: address,
        },
      });
    }

    res.status(200).send({
      message: "❤️ ❤️ ❤️ User added ❤️ ❤️ ❤️",
      data: {
        existing,
        user,
      },
    });
  } catch (err) {
    console.error("ERROR", err);
    res.status(500);
  }
};

export default handler;

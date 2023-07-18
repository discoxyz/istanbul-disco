import { PrismaClient, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("RECORD USER")
  const { address, did3 }: { address?: string; did3?: string } = JSON.parse(
    req.body
  );

  console.log(address, did3)

  if (!address) {
    res.status(400).send({
      message: "Provide an address or DID3",
    });
  }
  try {
    const exists = await prisma.user.upsert({
      create: {
        Address: address,
        Did3: did3,
      },
      update: {
        Did3: did3,
      },
      where: {
        Address: address,
      },
    });
    res.status(200).send({
      data: exists
    })
  } catch (err) {
    console.error(err);
    res.status(500);
  }
};

export default handler;

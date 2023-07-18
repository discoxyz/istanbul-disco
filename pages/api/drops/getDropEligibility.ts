import { PrismaClient, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, address, did3 }: { id: number; address?: string; did3?: string } =
    JSON.parse(req.body);

  const omitNull = (obj: any) => {
    Object.keys(obj)
      .filter((k) => obj[k] === null || obj[k] === undefined)
      .forEach((k) => delete obj[k]);
    return obj;
  };

  try {
    const addrRes = await prisma.claim.findFirst({
          where: {
            dropId: id,
            address: address,
          },
        });
    const didRes = await prisma.claim.findFirst({
          where: {
            dropId: id,
            address: did3,
          },
        })
    const finalRes =
      didRes && addrRes
        ? { ...omitNull(addrRes), ...omitNull(didRes) }
        : didRes || addrRes;
    res.status(200).send({
      data: { ...finalRes, claimed: finalRes.claimed || false } || null,
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

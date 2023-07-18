import { PrismaClient, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    subjectData,
    eligible,
    ...data
  }: Prisma.DropGetPayload<{}> & { gated?: boolean; eligible?: string } =
    JSON.parse(req.body);
  try {
    let recipientResult;
    const result = await prisma.drop.create({
      data: {
        ...data,
        subjectData: JSON.stringify(subjectData),
      },
    });
    if (data.gated && eligible) {
      const recipients: any[] = eligible.split(",").map((item) => {
        const clean = item.trim();
        return { dropId: result.id, address: clean };
      });
      recipientResult = await prisma.claim.createMany({
        data: recipients,
        skipDuplicates: true,
      });
    }
    res.status(200).send({
      message: "Data added",
      data: {
        result,
        recipientResult,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500);
  }
};

export default handler;

// id          Int     @id @default(autoincrement())
// drops       Drop    @relation(fields: [dropId], references: [id])
// dropId      Int
// user        User?   @relation(fields: [userAddr, userDid3], references: [Address, Did3])
// userAddr    String?
// userDid3    String?

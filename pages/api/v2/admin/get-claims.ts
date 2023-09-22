import { PrismaClient, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { recoverMessageAddress } from "viem";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { signature }: { signature: string } = JSON.parse(req.body);

  console.log('fetching claims api')
  const recoveredAddress = await recoverMessageAddress({
    message: `Get all claims from disco`,
    signature: signature as `0x${string}`,
  });

  const admin = process.env.ADMIN_ADDRESS?.split(',')
  console.log('admin', admin)
  if (!admin?.includes(recoveredAddress)) {
    res.status(400).send({
      message: "Not authenticated",
      deleted: false,
    });
    return;
  }

  try {
    const claims = await prisma.claim.findMany({
      where: {
        claimed: true,
      },
    });

    const claimHeaders = Object.values(Prisma.ClaimScalarFieldEnum);

    let csv = `${claimHeaders.join(",")}\n`;
    console.log(csv)
    const cols = claimHeaders.length;

    claims.map((c) => {
      claimHeaders.map((h, i) => {
        csv += c[h];
        if (i !== cols - 1) {
          csv += ','
        }
      });
      csv += `\n`;
    });

    console.log('csv built', csv)

    res
      .status(200)
      .setHeader("Content-Type", "text/csv")
      .setHeader("Content-Disposition", `attachment; filename="users.csv"`)
      .send(csv);
  } catch {
    res.status(500).send({
      message: "Error occurred",
    });
  }
};

export default handler;

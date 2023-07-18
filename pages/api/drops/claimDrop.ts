import { Prisma, PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const issueCred = async (did: string, schema: string, subjectData: {}) => {
  const discoHeaders = new Headers();
  discoHeaders.append("Content-Type", "application/json");
  discoHeaders.append("Authorization", `Bearer ${process.env.DISCO_API_KEY}`);

  const raw = JSON.stringify({
    schemaUrl: schema,
    subjectData: subjectData,
    recipientDID: did,
  });
  console.log(did)

  const opts = {
    method: "POST",
    headers: discoHeaders,
    body: raw,
  };

  try {
    console.log("TRY", raw)
    const iss = await fetch("https://api.disco.xyz/v1/credential/", {
      method: "POST",
      headers: discoHeaders,
      body: raw,
    });
    const res = await iss.json()
    console.log("SUCCESS", res)
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    dropId,
    did3,
    claimId,
  }: { dropId: number; did3: string; claimId?: number } = JSON.parse(req.body);
  console.log("BACKEND", did3)
  try {
    const result = await prisma.drop.findUnique({
      where: {
        id: dropId,
      },
    });

    if (result?.gated && claimId) {
      console.log("ITS GATED");
      const isValid = await prisma.claim.findFirst({
        where: {
          id: claimId,
        },
      });
      console.log("GATED VALID", isValid);
      const claim = await prisma.claim.update({
        where: {
          id: claimId,
        },
        data: {
          address: did3,
          claimed: true,
        },
      });
      console.log("CLAIM UPDATED", claim);

      await issueCred(
        did3,
        result.schema,
        JSON.parse(JSON.parse(result.subjectData))
      );

      res.status(200).send({
        message: "Data added",
        data: {
          claim,
        },
      });
    } else if (result?.gated && !claimId) {
      res.status(500).send({
        message: "Provide valid claimId",
      });
    } else if (result) {
      console.log("DROP EXISTS, CHECKING IF ALREADY CLAIMED");
      const data = await prisma.claim.findFirst({
        where: {
          claimed: true,
          address: did3,
          dropId: dropId,
        },
      });
      if (data === null) {
        const claim = await prisma.claim.create({
          data: {
            claimed: true,
            address: did3,
            dropId: dropId,
          },
        });
        console.log("ISSUE ATTEMPT")
        await issueCred(
          did3,
          result.schema,
          JSON.parse(JSON.parse(result.subjectData))
        );
      }
      res.status(200).send({
        message: "Data added",
        data: {
          // claim,
        },
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500);
  }
};

export default handler;

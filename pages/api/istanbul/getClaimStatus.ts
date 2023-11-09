import { Prisma, PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { owner, claimant }: { owner: string; claimant: string } = req.body;
  const person1 = `did:ethr:${owner.toLowerCase()}`;
  const person2 = `did:ethr:${claimant.toLowerCase()}`;

  const response = await fetch(`https://api.disco.xyz/v1/credentials/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DISCO_KEY}`,
    },
    body: JSON.stringify({
      conjunction: "and",
      criteria: [
        {
          field: "vc.credentialSubject.person1",
          operator: "=",
          value: person1,
        },
        {
          field: "vc.credentialSubject.person2",
          operator: "=",
          value: person2,
        },
      ],
      page: 1,
      count: 1,
    }),
  });
  
  const credentials = await response.json();
  console.log("CREDS", credentials);

  res.status(200).send({
    claimed: !!credentials.length,
  });

  return;
};

export default handler;

import { Prisma, PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    address,
    type,
    page,
  }: { address: string; type: "owner" | "claimant"; page?: number } = req.body;
  const value = `did:ethr:${address.toLowerCase()}`;
  let field = "vc.credentialSubject.person2";
  if (type === "claimant") field = "vc.credentialSubject.person1";
  console.log("value", value);
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
          field,
          operator: "=",
          value,
        },
        {
          field: "vc.credentialSubject.id",
          operator: "=",
          value,
        },
      ],
      size: 10,
      page: page || 1,
    }),
  });
  const nextPage = await fetch(`https://api.disco.xyz/v1/credentials/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DISCO_KEY}`,
    },
    body: JSON.stringify({
      conjunction: "and",
      criteria: [
        {
          field,
          operator: "=",
          value,
        },
        {
          field: "vc.credentialSubject.id",
          operator: "=",
          value,
        },
      ],
      size: 1,
      page: (page || 1) * 10 + 1,
    }),
  });
  const hasNextPage = !!(await nextPage.json()).length;
  const credentials = await response.json();
  console.log("credentials", credentials);
  const addresses = credentials.map((vcDoc: any) => ({
    address:
      type == "owner"
        ? vcDoc.vc.credentialSubject.person1.replace("did:ethr:", "")
        : vcDoc.vc.credentialSubject.person2.replace("did:ethr:", ""),
    time: vcDoc.vc.issuanceDate,
  }));
  if (credentials.length > 10) console.log("CREDS", addresses);

  res.status(200).send({
    data: addresses, // trim last from array
    page: page ||1,
    hasNextPage: hasNextPage,
    hasPrevPage: (page || 1) > 1,
  });

  return;
};

export default handler;

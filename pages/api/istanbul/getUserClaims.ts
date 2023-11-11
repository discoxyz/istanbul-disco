import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    address,
    type,
    page,
  }: { address: string; type: "owner" | "claimant"; page?: number } = req.body;
  const value = `did:ethr:${address.toLowerCase()}`;
  let field = "vc.credentialSubject.person2";
  if (type === "claimant") field = "vc.credentialSubject.person1";
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
          field: "issuer",
          operator: "=",
          value: process.env.ISSUER_DID,
        },
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
          field: "issuer",
          operator: "=",
          value: process.env.ISSUER_DID,
        },
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
  const nextP = await nextPage.json();
  //@ts-ignore
  const hasNextPage = !!nextP.length;
  const credentials = await response.json();
  const addresses = credentials.map((vcDoc: any) => ({
    address:
      type == "owner"
        ? vcDoc.vc.credentialSubject.person1.replace("did:ethr:", "")
        : vcDoc.vc.credentialSubject.person2.replace("did:ethr:", ""),
    time: vcDoc.vc.issuanceDate,
  }));

  res.status(200).send({
    data: addresses, // trim last from array
    page: page || 1,
    hasNextPage: hasNextPage,
    hasPrevPage: (page || 1) > 1,
  });

  return;
};

export default handler;

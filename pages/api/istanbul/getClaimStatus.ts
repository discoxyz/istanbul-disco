import { NextApiRequest, NextApiResponse } from "next";

export async function getClaimStatus(args: {
  owner: string;
  claimant: string;
}): Promise<{ claimed: boolean }> {
  const person1 = `did:ethr:${args.owner.toLowerCase()}`;
  const person2 = `did:ethr:${args.claimant.toLowerCase()}`;

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
      size: 1,
    }),
  });

  const credentials = await response.json();

  return {
    claimed: !!credentials.length,
  };
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { owner, claimant }: { owner: string; claimant: string } = req.body;
  res.status(200).send(await getClaimStatus({ owner, claimant }));

  return;
};

export default handler;

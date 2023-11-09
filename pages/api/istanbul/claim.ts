import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    owner: _owner,
    claimant: _claimant,
  }: { owner: string; claimant: string } = req.body;

  const owner = `did:ethr:${_owner.toLowerCase()}`;
  const claimant = `did:ethr:${_claimant.toLowerCase()}`;

  try {
    const result = await Promise.all(
      [owner, claimant].map(async (did) => {
        console.log("issue to ", did);
        const result = await fetch("https://api.disco.xyz/v1/credential", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${process.env.DISCO_KEY}`,
          },
          body: JSON.stringify({
            issuer: process.env.ISSUER_DID,
            schemaUrl:
              "https://raw.githubusercontent.com/discoxyz/disco-schemas/main/json/AttestedMetIrlCredential/1-0-0.json",
            recipientDID: did,
            subjectData: {
              person1: `${owner}`,
              person2: `${claimant}`,
            },
            expirationDate: "",
          }),
        });
        const parsed = await result.json();
        console.log(parsed);
        return parsed;
      }),
    );
    console.log(result);
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(500).send({ success: false });
    throw error;
  }
};

export default handler;

import { NextApiRequest, NextApiResponse } from "next";
import { getClaimStatus } from "./getClaimStatus";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    owner: _owner,
    claimant: _claimant,
  }: { owner: string; claimant: string } = req.body;

  const owner = `did:ethr:${_owner.toLowerCase()}`;
  const claimant = `did:ethr:${_claimant.toLowerCase()}`;

  try {
    const status = await getClaimStatus({ owner: _owner, claimant: _claimant });
    if (status.claimed) {
      res.status(500).send({ success: false });
      return;
    }
    
    await Promise.all(
      [owner, claimant].map(async (did) => {
        await fetch("https://api.disco.xyz/v1/credential", {
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
      }),
    );
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(500).send({ success: false });
    throw error;
  }
};

export default handler;

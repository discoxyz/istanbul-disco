import { kv } from "@vercel/kv";
import { NextApiRequest, NextApiResponse } from "next";
import { issueCredential } from "../../apiFn/utils";
import { drops } from "../../content/drops";

const issueEiffelCredential = async (recipient: string, dropId: number): Promise<boolean> => {
  const drop = drops.find(drop => dropId === drop.dropId)
  if (!drop) throw Error('Invalid drop ID')

  const schemaUrl = drop.schema
  const subjectData = drop.credentialSubject

  try {
    const credRes = await issueCredential(schemaUrl, recipient, subjectData);
    return credRes;
  } catch (error) {
    console.error("Failed to issue credential", error);
    return false;
  }
};

const issueCred = async (did: string, dropId: number) => {
  try {
    const credRes = await issueEiffelCredential(did, dropId);
    return credRes;
  } catch (error) {
    console.error("Failed to issue credential:", error);
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { did, address, dropId } = JSON.parse(req.body);
  try {
    const fetchedDid = await kv.hget(address, "did");
    if (fetchedDid == did) {
      try {
        try {
          const success = await issueCred(did, dropId);
          if (success) {
            const claims = await kv.hget(address, "claimed") as string[] || []
            console.log("ADDRESS HAS CLAIMED", claims)
            await kv.hset(address, { did: did, claimed: [...claims, dropId] });
            res.status(200).send({
              success: true,
              message: `Credential sent to ${did}`,
            });
          } else {
            throw Error("Failed to issue credential");
          }
        } catch (err) {
          console.log(err);
          throw err;
        }
      } catch {
        res.status(500).send({
          success: false,
          message:
            "Failed to set credential claim status but credentail issued",
        });
      }
    } else {
      res.status(500).send({
        success: false,
        message: "DID does not match address",
      });
    }
  } catch (err) {
    console.error("Something went wront when sending the credential", err);
  }
};

export default handler;

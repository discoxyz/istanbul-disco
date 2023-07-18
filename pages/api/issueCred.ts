import { kv } from "@vercel/kv";
import { NextApiRequest, NextApiResponse } from "next";
import { issueCredential } from "../../apiFn/utils";

const issueEiffelCredential = async (recipient: string): Promise<boolean> => {
  const schemaUrl =
    "https://raw.githubusercontent.com/discoxyz/disco-schemas/main/json/AttendanceCredential/1-0-0.json";

  const subjectData = {
    eventName: "Eiffel Disco",
  };

  try {
    const credRes = await issueCredential(schemaUrl, recipient, subjectData);
    return credRes;
  } catch (error) {
    console.error("Failed to issue credential", error);
    return false;
  }
};

const issueCred = async (did: string) => {
  const discoHeaders = new Headers();
  discoHeaders.append("Content-Type", "application/json");
  discoHeaders.append("Authorization", `Bearer ${process.env.DISCO_API_TOKEN}`);

  const raw = JSON.stringify({
    schemaUrl:
      "https://raw.githubusercontent.com/discoxyz/disco-schemas/main/json/AttendanceCredential/1-0-0.json",
    subjectData: {
      eventName: "Eiffel in Crypto",
      eventDescription: "Commemorating the one and only Eiffel Tower on July 18th for an unforgettable evening where we'll discuss Account Abstraction, Smart Accounts, ERC-4337, wallets, and more with cocktails and networking with Safe, Disco.xyz, Request Finance, Monerium, Gnosis Chain, Gateway.fm, and Gelato Network.",
      eventDate: "18 July 2023"
    },
    recipientDID: did,
  });

  try {
    const credRes = await issueEiffelCredential(did);
    return credRes;
  } catch (error) {
    console.error("Failed to issue credential:", error);
  }

  const opts = {
    method: "POST",
    headers: discoHeaders,
    body: raw,
  };

  return opts;
};

const discoHeaders = new Headers();
discoHeaders.append("Content-Type", "application/json");
discoHeaders.append("Authorization", `Bearer ${process.env.DISCO_API_TOKEN}`);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { did, address } = JSON.parse(req.body);
  try {
    const fetchedDid = await kv.hget(address, "did");
    if (fetchedDid == did) {
      try {
        try {
          const success = await issueCred(did);
          if (success) {
            await kv.hset(address, { did: did, claimed: true });
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

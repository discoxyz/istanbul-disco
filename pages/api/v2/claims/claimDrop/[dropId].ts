import { PrismaClient, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { recoverMessageAddress } from "viem";

const prisma = new PrismaClient();

const issueCred = async (_did: string, schema: string, subjectData: {}) => {
  const discoHeaders = new Headers();
  discoHeaders.append("Content-Type", "application/json");
  discoHeaders.append("Authorization", `Bearer ${process.env.DISCO_API_KEY}`);
  let did = _did;

  if (did.startsWith("0x")) did = `did:pkh:eip155:1:${did}`;

  const raw = JSON.stringify({
    schemaUrl: schema,
    subjectData: subjectData || {},
    recipientDID: did,
  });

  const opts = {
    method: "POST",
    headers: discoHeaders,
    body: raw,
  };

  try {
    const iss = await fetch("https://api.disco.xyz/v1/credential/", {
      method: "POST",
      headers: discoHeaders,
      body: raw,
    });
    const res = await iss.json();
    if (res.status === 400) {
      throw Error("Failed to issue, " + res.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    claimingAddress,
    signature,
    message,
    dropId,
  }: {
    claimingAddress: string;
    signature: string;
    message: string;
    dropId: number;
  } = JSON.parse(req.body);

  if (!dropId) {
    throw Error("No id provided");
  }

  // Verify that the data matches the provided signature
  const recoveredAddress = await recoverMessageAddress({
    message: message,
    signature: signature as `0x${string}`,
  });

  if (claimingAddress !== recoveredAddress) {
    res.status(400).send({
      message: `Signagure does not match address provided or data. ${claimingAddress} may be eligible for this credential but you provided a message signed by ${recoveredAddress}`,
    });
    return;
  }

  try {
    const toClaim = await prisma.claim.findFirst({
      where: {
        dropId: dropId,
        address: claimingAddress as string,
      },
    });

    const drop = await prisma.drop.findFirstOrThrow({
      where: {
        id: dropId,
      },
    });

    if (!toClaim && drop.gated) {
      res.status(400).send({
        message: `${claimingAddress} is not eligible for this credential`,
      });
      return;
    } else if (toClaim?.claimed) {
      res.status(400).send({
        message: `${claimingAddress} has already claimed this credential`,
      });
      return;
    }

    // Issue credential
    try {
      const issue = await issueCred(
        claimingAddress,
        drop.schema,
        JSON.parse(drop.subjectData)
      );

      let claim = undefined;
      if (!issue) {
        res.status(500).send({
          message:
            "Failed to issue. The schema may not match the provided fields",
        });
        return;
      } else {
        if (toClaim) {
          claim = await prisma.claim.update({
            where: { id: toClaim.id },
            data: {
              claimed: true,
            },
          });
        } else {
          claim = await prisma.claim.create({
            data: {
              address: claimingAddress,
              dropId: dropId,
              claimed: true,
            },
          });
        }
      }

      if (!claim) {
        res.status(500).send({
          message: "Failed to claim drop but credential issued",
        });
      }

      res.status(200).send({
        message: "Claimed!",
        claim: claim,
      });
    } catch (err) {
      res.status(500).send({
        message:
          "Failed to issue. The schema may not match the provided fields",
      });
      return;
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Something went wrong when claiming",
      data: [],
    });
  }
};

export default handler;

import { PrismaClient, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { recoverMessageAddress } from "viem";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    signature,
    createdByAddress,
    id,
    ..._dropData
  }: Prisma.DropGetPayload<{}> & { claims: string[] } = JSON.parse(req.body);

  const invalid = /[^A-Za-z0-9_-]/.test(_dropData.path);
  if (invalid || _dropData.path == 'my-claims' || _dropData.path === 'my-drops' || _dropData.path === 'admin') {
    res.status(400).send({
      message: "Path is invalid",
    });
    return
  }

  // Verify that the data matches the provided signature
  const recoveredAddress = await recoverMessageAddress({
    message: JSON.stringify(_dropData),
    signature: signature as `0x${string}`,
  });

  // ENSURE DUPE CLAIMS ARE NOT CREATED
  let { claims: _claims, ...dropData } = _dropData;
  let _existingClaims: Prisma.ClaimGetPayload<{}>[] = [];
  let existingClaims: string[] = [];
  if (id) {
    _existingClaims = await prisma.claim.findMany({
      where: {
        dropId: id,
      },
    });
    existingClaims = _existingClaims.map((a) => a.address) || [];
  }

  const claims = _claims.filter((a) => !!a && !existingClaims.includes(a));

  const claimsToRemove = _existingClaims
    .filter((c) => c.claimed === false && !_claims.includes(c.address))
    .map((a) => a.address);

  let removedClaims = undefined;
  if (claimsToRemove.length) {
    removedClaims = await prisma.claim.deleteMany({
      where: {
        address: {
          in: claimsToRemove,
        },
      },
    });
  }

  if (createdByAddress !== recoveredAddress) {
    res.status(400).send({
      message: `Signagure does not match address provided or data. The data was signed by ${recoveredAddress} but you provided ${createdByAddress}`,
    });
  }

  // const;

  try {
    const data = {
      ...dropData,
      signature,
      // createdByAddress,
      createdByUser: {
        connectOrCreate: {
          where: {
            address: createdByAddress,
          },
          create: {
            address: createdByAddress,
          },
        },
      },
      claims: {
        create: claims.map((c) => {
          return {
            address: c,
          };
        }),
      },
    };

    let type: "updated" | "added" | "failed" = "failed";
    let drop;
    let deleted;
    let users;

    // Create users
    if (claims) {
      users = await prisma.user.createMany({
        data: claims.map((c) => ({ address: c })),
        skipDuplicates: true,
      });
    }

    if (id) {
      type = "updated";
      drop = await prisma.drop.update({
        where: {
          id: id,
        },
        data,
      });
    } else {
      type = "added";
      drop = await prisma.drop.create({
        data,
      });
    }

    res.status(200).send({
      message: `❤️ ❤️ ❤️ Drop ${type} ❤️ ❤️ ❤️`,
      data: {
        deleted,
        removedClaims,
        users,
        // removedClaims,
        drop,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500);
  }
};

export default handler;

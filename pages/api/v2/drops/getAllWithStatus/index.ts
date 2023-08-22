import { PrismaClient, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Address } from "viem";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    claimingAddress,
    dropId,
    path,
    withClaims,
    createdByAddress,
    withClaimsBy,
  }: {
    claimingAddress?: string;
    dropId?: number;
    path?: string;
    withClaims?: boolean;
    createdByAddress?: string;
    withClaimsBy?: string;
  } = JSON.parse(req.body);

  try {
    const drops = await prisma.drop.findMany({
      where: {
        path: path,
        id: dropId,
        createdByAddress: createdByAddress,
      },
      ...(withClaims || claimingAddress
        ? {
            include: {
              // claims: true,
              claims: !withClaimsBy
                ? true
                : {
                    where: {
                      address: withClaimsBy,
                    },
                  },
            },
          }
        : {}),
    });

    const _drops = drops.map(
      (
        drop: Prisma.DropGetPayload<{}> & {
          claims?: Prisma.ClaimGetPayload<{}>[];
        }
      ) => {
        let status = {
          eligible: !drop.gated,
          claimed: false,
        };

        if (claimingAddress && drop.gated) {
          status.eligible = drop.claims?.find(
            (c: Prisma.ClaimGetPayload<{}>) => c.address == claimingAddress
          )
            ? true
            : false;
        }
        status.claimed = drop.claims?.find(
          (c: Prisma.ClaimGetPayload<{}>) =>
            c.address == claimingAddress && c.claimed
        )
          ? true
          : false;

        return {
          ...drop,
          ...(claimingAddress && { status }),
        };
      }
    );

    res.status(200).send({
      message: `${drops.length} Drops found`,
      data: {
        drops: _drops,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Something went wrong when finding the drop",
      data: [],
    });
  }
};

export default handler;

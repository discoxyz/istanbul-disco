import { PrismaClient, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Address, recoverMessageAddress } from "viem";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    id,
    signature,
    createdByAddress,
    ..._dropData
  }: Prisma.DropGetPayload<{}> & { recipients: Address[] } = JSON.parse(
    req.body
  );
  // Verify that the data matches the provided signature

  const recoveredAddress = await recoverMessageAddress({
    message: JSON.stringify(_dropData),
    signature: signature as `0x${string}`,
  });

  const { recipients, ...dropData } = _dropData;


  if (createdByAddress !== recoveredAddress) {
    res.status(400).send({
      message: `Signagure does not match address provided or data. The data was signed by ${recoveredAddress} but you provided ${createdByAddress}`,
    });
    return;
  }
  // Verify that the address matches the previous signature
  const previousDrop = await prisma.drop.findUniqueOrThrow({
    where: {
      id: id,
    },
  });


  if (previousDrop.createdByAddress !== createdByAddress) {
    res.status(400).send({
      message: `The address that created this drop does not match the one that you are attempting to update it with.`,
    });
    return;
  }


  // ❤️ ❤️ ❤️
  // YASS LES SGO
  // ❤️ ❤️ ❤️

  try {
    // Update drop
    const dropResult = await prisma.drop.update({
      where: {
        id: id,
      },
      data: {
        ...dropData,
        signature,
      },
    });


    // Update recipients
    let baseRecipients = recipients || [];
    let addedRecipients = undefined;
    let removedRecipients = undefined;

    // Filter out addresses with claims
    const claimed = await prisma.claim.findMany({
      where: {
        dropId: id,
      },
    });

    const unclaimedAddresses =
      claimed.filter((el) => !el.claimed).map((el) => el.address) || [];
    const toDelete =
      unclaimedAddresses.filter(
        (el) => !baseRecipients.includes(el as Address)
      ) || [];
    const toAdd =
      unclaimedAddresses.filter((el) => recipients.includes(el as Address)) ||
      [];


    // Remove unclaimed recipients NOT in the recipient list
    removedRecipients = await prisma.claim.deleteMany({
      where: {
        dropId: id,
        claimed: false,
        address: {
          in: toDelete,
        },
      },
    });

    // Create addresses if they don't exist
    // Create users if they don't exist

    await prisma.user.createMany({
      data: recipients.map((address: Address) => ({ address: address })),
      skipDuplicates: true,
    });

    // Add new recipients
    const recipientData = toAdd.map((address: string) => ({
      dropId: dropResult.id,
      address,
    }));

    addedRecipients = await prisma.claim.createMany({
      data: recipientData,
      skipDuplicates: true,
    });

    res.status(200).send({
      message: "❤️ ❤️ ❤️ Drop updated ❤️ ❤️ ❤️",
      data: {
        dropResult,
        removedRecipients,
        addedRecipients,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500);
  }
};

export default handler;

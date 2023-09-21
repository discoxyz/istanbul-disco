import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
const stripe = require("stripe")(process.env.STRIPE_KEY);

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    dropId,
    dropPath,
    userAddress,
  }: {
    // stripeId: string;
    dropId: number;
    dropPath: string;
    userAddress: string;
  } = JSON.parse(req.body);

  try {
    const status = await prisma.purchase.findFirst({
      where: {
        dropId: dropId,
      },
    });

    if (!status) {
      // Create payment link
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: process.env.STRIPE_INSIGHTS_PRICE,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_VERCEL_URL}/my-drops/${dropPath}?purchase=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_VERCEL_URL}/my-drops/${dropPath}?purchase=cancel`,
        client_reference_id: `Drop ID: ${dropId}`,
      });
      // Create record
      // Upsert to avoid duplication error
      const _status = await prisma.purchase.upsert({
        where: {
          dropId: dropId
        },
        create: {
          stripeId: session.id,
          dropId: dropId,
          link: session.url,
          userAddress: userAddress,
        },
        update: {
          stripeId: session.id,
          link: session.url,
          userAddress: userAddress,
        },
      });

      res.status(200).send({
        message: `Link created`,
        payment: _status,
      });
      return;
    }

    if (status.paid) {
      res.status(200).send({
        message: `Link fetched`,
        payment: status,
      });
      return;
    }

    // Check if payment status has changed
    const session = await stripe.checkout.sessions.retrieve(status.stripeId);
    let _status = status;
    if (session.payment_status === "paid") {
      _status = await prisma.purchase.update({
        where: {
          dropId: dropId,
        },
        data: {
          paid: true,
        },
      });
    }
    res.status(200).send({
      message: `Link created`,
      payment: _status,
    });
    return;

  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Link creation unsuccessful",
      data: [],
    });
  }
};

export default handler;

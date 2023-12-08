// Next.js Route Handlers (App Router)
import { cookies } from "next/headers";
import { IronSessionData, getIronSession } from "iron-session";
import { SiweMessage, generateNonce } from "siwe";
import { NextRequest, NextResponse } from "next/server";
import { ironOptions } from "../../../lib/api/ironOptions";

// login
// send siwe in payload
export async function POST(request: NextRequest) {
  const session = await getIronSession<IronSessionData>(cookies(), ironOptions);
  const body = await request.json();

  try {
    const { message, signature } = body;
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });

    if (fields.data.nonce !== session.nonce) {
      return new NextResponse(JSON.stringify({ message: "Invalid nonce." }), {
        status: 422,
      });
    }

    session.siwe = fields;
    await session.save();
    return NextResponse.json({ ok: true, ...session });
  } catch (_error) {
    return new NextResponse(JSON.stringify({ ok: false }), { status: 500 });
  }
}

// read session
// Will return siwe if logged in
// Will return nonce if not logged in
export async function GET() {
  const session = await getIronSession<IronSessionData>(cookies(), ironOptions);
  if (session.siwe) {
    return NextResponse.json(session);
  } else {
    session.nonce = generateNonce();
    await session.save();
    return NextResponse.json(session);
  }
}

// logout
export async function DELETE() {
  const session = await getIronSession<IronSessionData>(cookies(), ironOptions);
  session.destroy();
  return NextResponse.json({ loggedOut: true });
}

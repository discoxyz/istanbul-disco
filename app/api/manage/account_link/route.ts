import { NextRequest, NextResponse } from "next/server";
import { SupportedLink, supportedLinks } from "../../../../lib/accountLinks";
import { IronSessionData, getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { ironOptions } from "../../../../lib/api/ironOptions";
import { getSession } from "@auth0/nextjs-auth0";
import { getUser } from "../../../../lib/api/getUser";
import { parseId } from "../../../../lib/validation";
// import { IronSessionData, getIronSession } from "iron-session";
// import { cookies } from "next/headers";
// import { ironOptions } from "../../../lib/api";

export interface AccountLinkReq {
  type: SupportedLink;
  username: string;
}

export const POST = async (req: NextRequest) => {
  const { type, username }: AccountLinkReq = await req.json();

  if (!username) return new NextResponse("No username", { status: 400 });
  if (!type) return new NextResponse("No type", { status: 400 });
  if (!supportedLinks.includes(type))
    return new NextResponse("Invalid type", { status: 400 });

  // Validate session
  // email first, then wallet
  const recipient = await getUser();
  if (!recipient) return new NextResponse("No active session", { status: 500 });
  try {
    const response = await fetch("https://api.disco.xyz/v1/credential", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.DISCO_KEY}`,
      },
      body: JSON.stringify({
        issuer: process.env.ISSUER_DID,
        schemaUrl:
          "https://raw.githubusercontent.com/discoxyz/disco-schemas/main/json/AccountLinkageCredential/1-0-0.json",
        recipientDID: recipient,
        subjectData: {
          type,
          username,
        },
        expirationDate: "",
      }),
    });
    const link = await response.json();
    return NextResponse.json({
      username: link.vc.credentialSubject.username,
      type: link.vc.credentialSubject.type,
      id: link.vc.id,
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ success: false }), {
      status: 500,
    });
  }
};

export const GET = async (req: NextRequest) => {
  const body = await req.json();
  const { address: _address } = body;

  if (!_address)
    return new NextResponse("No address provided", { status: 400 });
  try {
    const address = parseId(_address);
    const response = await fetch(
      `https://api.disco.xyz/v1/credentials/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DISCO_KEY}`,
        },
        body: JSON.stringify({
          conjunction: "and",
          criteria: [
            {
              field: "schema",
              operator: "=",
              value:
                "https://raw.githubusercontent.com/discoxyz/disco-schemas/main/json/AccountLinkageCredential/1-0-0.json",
            },
            {
              field: "issuer",
              operator: "=",
              value: process.env.ISSUER_DID,
            },
            {
              field: "vc.credentialSubject.id",
              operator: "=",
              value: address,
            },
          ],
          page: 1,
          size: 1,
        }),
      },
    );
    const links = await response.json();
    return NextResponse.json({ links });
  } catch (error) {
    return new NextResponse("Something went wrong", { status: 503 });
  }
};

export const DELETE = async (req: NextRequest) => {
  return new NextResponse("Disco has not implemented credential deletion", {
    status: 503,
  });
  const { type, username }: AccountLinkReq = await req.json();

  const recipient = await getUser();
  if (!recipient) return new NextResponse("No active session", { status: 403 });
  let links: any[] = [];
  try {
    const response = await fetch("https://api.disco.xyz/v1/credential", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.DISCO_KEY}`,
      },
      body: JSON.stringify({
        subject: [recipient],
        criteria: [
          {
            field: "issuer",
            operator: "=",
            value: process.env.ISSUER_DID,
          },
          {
            field: "vc.credentialSchema.id",
            operator: "=",
            value:
              "https://github.com/discoxyz/disco-schemas/blob/main/json/AccountLinkageCredential/1-0-0.json",
          },
          {
            field: "vc.credentialSubject.type",
            operator: "=",
            value: type,
          },
          {
            field: "vc.credentialSubject.username",
            operator: "=",
            value: type,
          },
        ],
      }),
    });
    links = await response.json();
  } catch {
    return new NextResponse("Upstream service unavailable", { status: 503 });
  }
  if (!links.length) {
    return new NextResponse("Account link not found", { status: 400 });
  }
  // When service is available, map through returned creds to delete them
  // await Promise.all(links.map(async (l) => await fetch("DELETE", {
  //   method: 'DELETE'
  // })));
  return NextResponse.json({ success: true });
};

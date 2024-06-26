import { NextRequest, NextResponse } from "next/server";
import { getUser } from "../../../../lib/api/getUser";
import { v4 } from "uuid";

export interface ProfilePostReq {
  bio: string;
}

export const maxDuration = 60;

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const { bio } = body;

  const recipient = await getUser();
  if (!recipient) return new NextResponse("No active session", { status: 500 });
  if (!bio) return new NextResponse("No bio provided", { status: 400 });
  try {
    await fetch("https://api.disco.xyz/v1/credential", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.DISCO_KEY}`,
      },
      body: JSON.stringify({
        issuer: process.env.ISSUER_DID,
        schemaUrl:
          "https://raw.githubusercontent.com/discoxyz/disco-schemas/main/json/ProfileCredential/1-0-0.json",
        recipientDID: recipient,
        subjectData: {
          bio,
        },
        expirationDate: "",
      }),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Something went wrong", { status: 503 });
  }
};

export const GET = async () => {
  const currentUserAddress = await getUser();
  if (!currentUserAddress) {
    return new NextResponse("No address provided", { status: 400 });
  }
  const start = Date.now();
  const id = v4();
  console.log(`FETCH OWN ${currentUserAddress}`, {
    status: "start",
    id: id,
    elapsed: (Date.now() - start) / 1000,
  });
  try {
    const bioResponse = await fetch(
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
                "https://raw.githubusercontent.com/discoxyz/disco-schemas/main/json/ProfileCredential/1-0-0.json",
            },
            {
              field: "issuer",
              operator: "=",
              value: process.env.ISSUER_DID,
            },
            {
              field: "vc.credentialSubject.id",
              operator: "=",
              value: currentUserAddress,
            },
          ],
          page: 1,
          size: 1,
        }),
      },
    );
    const bio = await bioResponse.json();
    console.log(`FETCH OWN ${currentUserAddress}`, {
      status: "got bio, fetching links",
      id: id,
      elapsed: (Date.now() - start) / 1000,
    });

    const linkResponse = await fetch(
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
              value: currentUserAddress,
            },
          ],
        }),
      },
    );

    const links = await linkResponse.json();
    console.log(`FETCH OWN ${currentUserAddress}`, {
      status: "complete",
      id: id,
      elapsed: (Date.now() - start) / 1000,
    });
    return NextResponse.json({
      bio: bio?.length ? bio[0].vc.credentialSubject.bio || "" : "",
      links: links.map((l: any) => ({
        username: l.vc.credentialSubject.username,
        type: l.vc.credentialSubject.type,
        isPublic: l.isPublic,
        id: l.vc.id,
      })),
    });
  } catch (error) {
    return new NextResponse("Something went wrong", { status: 503 });
  }
};

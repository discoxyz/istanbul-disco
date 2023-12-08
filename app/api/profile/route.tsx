import { NextRequest, NextResponse } from "next/server";
import { getUser } from "../../../lib/api/getUser";
import { parseId } from "../../../lib/validation";
import { v4 as uuid} from 'uuid'


export const maxDuration = 60;

export const POST = async (req: NextRequest) => {
  const currentUserAddress = await getUser();
  const id = uuid()
  let requestedAddress: string | undefined = undefined;
  try {
    const body = await req.json();
    body
    if (body.address) requestedAddress = parseId(body.address);
  } catch {
    return new NextResponse("No address provided in body", { status: 400 });
  }

  let status = {
    claimedYours: false,
    youClaimed: false,
  };
  const start1 = Date.now();
  console.log(`FETCH ${requestedAddress}`, {
    status: 'start',
    id: id,
    elapsed: 0,
  })
  // CHECK IF MUTUAL
  if (currentUserAddress && requestedAddress) {
    const person1 = requestedAddress;
    const person2 = currentUserAddress;
    console.log(`FETCH ${requestedAddress}`, {
      status: 'get mutual status 1/2',
      id: id,
      elapsed: (Date.now() - start1) / 1000,
    })
    const response1 = await fetch(
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
              field: "issuer",
              operator: "=",
              value: process.env.ISSUER_DID,
            },
            {
              field: "vc.credentialSubject.person1",
              operator: "=",
              value: person1,
            },
            {
              field: "vc.credentialSubject.person2",
              operator: "=",
              value: person2,
            },
          ],
          page: 1,
          size: 1,
        }),
      },
    );

    console.log(`FETCH ${requestedAddress}`, {
      status: 'get mutual status 2/2',
      id: id,
      elapsed: (Date.now() - start1) / 1000,
    })

    const response2 = await fetch(
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
              field: "issuer",
              operator: "=",
              value: process.env.ISSUER_DID,
            },
            {
              field: "vc.credentialSubject.person1",
              operator: "=",
              value: person2,
            },
            {
              field: "vc.credentialSubject.person2",
              operator: "=",
              value: person1,
            },
          ],
          page: 1,
          size: 1,
        }),
      },
    );
    status = {
      claimedYours: !!(await response2.json()).length,
      youClaimed: !!(await response1.json()).length,
    };
    console.log(`FETCH ${requestedAddress}`, {
      status: 'get mutual status complete',
      id: id,
      elapsed: (Date.now() - start1) / 1000,
    })
  }
  // END MUTUAL CHECK
  try {
    console.log(`FETCH ${requestedAddress}`, {
      status: 'get bio',
      id: id,
      elapsed: (Date.now() - start1) / 1000,
    })
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
              value: requestedAddress,
            },
          ],
          page: 1,
          size: 1,
        }),
      },
    );
    const bio = await bioResponse.json();
    console.log(`FETCH ${requestedAddress}`, {
      status: 'get links',
      id: id,
      elapsed: (Date.now() - start1) / 1000,
    })
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
              value: requestedAddress,
            },
            // If mutual, get private links
            !status.claimedYours || !status.youClaimed
              ? {
                  field: "isPublic",
                  operator: "=",
                  value: true,
                }
              : {},
          ],
        }),
      },
    );

    const links = await linkResponse.json();
    console.log(`FETCH ${requestedAddress}`, {
      status: 'complete',
      id: id,
      elapsed: (Date.now() - start1) / 1000,
    })
    return NextResponse.json({
      bio: bio.length ? bio[0].vc.credentialSubject.bio || "" : "",
      links: links.map((l: any) => ({
        username: l.vc.credentialSubject.username,
        type: l.vc.credentialSubject.type,
        isPublic: l.isPublic,
      })),
      status,
    });
  } catch (error) {
    return new NextResponse("Something went wrong", { status: 503 });
  }
};

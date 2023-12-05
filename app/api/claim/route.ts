import { NextRequest, NextResponse } from "next/server";
import { getClaimStatus } from "../getClaimStatus/route";
import { parseId } from "../../../lib/validation";
// import { IronSessionData, getIronSession } from "iron-session";
// import { cookies } from "next/headers";
// import { ironOptions } from "../../../lib/api";

export const POST = async (req: NextRequest) => {
  const {
    owner: _owner,
    claimant: _claimant,
  }: { owner: string; claimant: string } = await req.json();
  // const session = await getIronSession<IronSessionData>(cookies(), ironOptions);

  // if (session.siwe?.data.address != _claimant) {
  //   return Response.json("Claimant does not match logged in user");
  // }

  let owner: string;
  let claimant: string;

  try {
    owner = parseId(_owner);
    claimant = parseId(_claimant);
  } catch {
    return new NextResponse("Invalid owner or claimant", { status: 400 });
  }

  try {
    const status = await getClaimStatus({ owner: _owner, claimant: _claimant });
    if (status.claimed) {
      return new NextResponse(JSON.stringify({ success: false }), {
        status: 500,
      });
    }

    await Promise.all(
      [owner, claimant].map(async (did) => {
        await fetch("https://api.disco.xyz/v1/credential", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${process.env.DISCO_KEY}`,
          },
          body: JSON.stringify({
            issuer: process.env.ISSUER_DID,
            schemaUrl:
              "https://raw.githubusercontent.com/discoxyz/disco-schemas/main/json/AttestedMetIrlCredential/1-0-0.json",
            recipientDID: did,
            subjectData: {
              person1: `${owner}`,
              person2: `${claimant}`,
            },
            expirationDate: "",
          }),
        });
      }),
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse(JSON.stringify({ success: false }), {
      status: 500,
    });
  }
};

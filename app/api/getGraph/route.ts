import { randomBytes } from "crypto";
import { uuidV4 } from "ethers";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const resData = await fetch(`https://api.disco.xyz/v1/credentials/search`, {
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
              "https://raw.githubusercontent.com/discoxyz/disco-schemas/main/json/AttestedMetIrlCredential/1-0-0.json",
          },
          {
            field: "issuer",
            operator: "=",
            value: process.env.ISSUER_DID,
          },
        ],
        size: 2000,
      }),
    });

    if (!resData.ok) {
      // If the response is not okay, return an error message
      throw new Error(`Failed to fetch data, status: ${resData.status}`);
    }

    const data: any = await resData.json();

    // Check if data is an array before proceeding
    if (!Array.isArray(data)) {
      throw new Error(
        "Expected data to be an array, but received something else.",
      );
    }

    const parsed = data
      .map((d: any) => ({
        owner: d.vc.credentialSubject.person1,
        claimant: d.vc.credentialSubject.person2,
      }))
      .filter(
        (value: any, index: any, self: any) =>
          index ===
          self.findIndex(
            (t: any) =>
              t.owner === value.owner && t.claimant === value.claimant,
          ),
      );

    const links: { source: string; target: string }[] = [];
    const nodes: {
      [key: string]: {
        id: string;
        name: string;
        val: number;
      };
    } = {};

    parsed.forEach((p: any) => {
      if (!nodes[p.owner]) {
        const id = uuidV4(randomBytes(20));
        nodes[p.owner] = {
          id,
          name: "anon " + id.substring(0, 6),
          val: 1,
        };
      } else {
        nodes[p.owner].val++;
      }

      if (!nodes[p.claimant]) {
        const id = uuidV4(randomBytes(20));
        nodes[p.claimant] = {
          id,
          name: "anon " + id.substring(0, 6),
          val: 1,
        };
      }

      links.push({
        source: nodes[p.owner].id,
        target: nodes[p.claimant].id,
      });
    });

    const output = {
      nodes: Object.values(nodes),
      links,
    };

    return NextResponse.json({ data: output });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 },
    );
  }
};

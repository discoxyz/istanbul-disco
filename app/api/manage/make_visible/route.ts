import { NextRequest, NextResponse } from "next/server";
import { getUser } from "../../../../lib/api/getUser";

export interface LinkUpdateReq {
  id: string;
  visible: boolean;
}

export const POST = async (req: NextRequest) => {
  const { id, visible }: LinkUpdateReq = await req.json();
  console.log({ id, visible });
  if (!id) return new NextResponse("No id", { status: 400 });
  if (!visible) return new NextResponse("No visibility", { status: 400 });

  // Validate session
  // email first, then wallet
  const subject = await getUser();
  if (!subject) return new NextResponse("No active session", { status: 500 });

  try {
    const response = await fetch(
      `https://api.disco.xyz/v1/credential/${encodeURIComponent(
        id,
      )}?isPublic=${visible}`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${process.env.DISCO_KEY}`,
        },
      },
    );
    // const link = await response.json();
    console.log(response.status, response.statusText);
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ success: false }), {
      status: 500,
    });
  }
};

import type { Metadata } from "next";
import { DropView } from "../../views/drop";
import { PrismaClient } from "@prisma/client";
type Props = {
  params: { path: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const prisma = new PrismaClient();

export async function generateMetadata(
  { params }: Props,
  // parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const path = params.path;
  const drop = await prisma.drop.findFirst({
    where: {
      path: path,
    },
  });

  return {
    title: drop?.name ? `🪩 ${drop.name}` : "🪩 Disco Drops",
    other: {
      "twitter:card": "summary_large_image",
      "twitter:title": `Disco Drops: ${drop?.name}`,
      "twitter:site": "@discoxyz",
      "twitter:description": `Check your eligibility &amp; claim your credential now`,
      "og:description": `Check your eligibility &amp; claim your credential now`,
      "og:title": `Disco Drops: ${drop?.name}`,
      // REPLACE WITH SSR CRED IMAGE
      "twitter:image":
        drop?.image || "https://fzt.aqp.mybluehost.me/images/bg_disco.png",
        "og:image":
          drop?.image || "https://fzt.aqp.mybluehost.me/images/bg_disco.png",
    },
  };
}

const Page = () => <DropView />;

export default Page;

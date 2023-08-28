import type { Metadata } from "next";
import { DropView } from "../../../views/drop";
import { PrismaClient } from "@prisma/client";
type Props = {
  params: { path: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const prisma = new PrismaClient();

export async function generateMetadata(
): Promise<Metadata> {


  return {
    title: "My drops",
  };
}

const Page = () => <DropView />;

export default Page;

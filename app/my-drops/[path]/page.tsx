import type { Metadata } from "next";
import { DropView } from "../../../views/drop";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "My drops",
  };
}

const Page = () => <DropView />;

export default Page;

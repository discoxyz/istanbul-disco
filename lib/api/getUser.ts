import { getSession } from "@auth0/nextjs-auth0";
import { IronSessionData, getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { ironOptions } from "./ironOptions";

export const getUser = async () => {
  const auth0Session = await getSession();
  let ethSession = await getIronSession<IronSessionData>(
    cookies(),
    ironOptions,
  );
  let recipient: string | false = false;
  if (auth0Session?.user.email) {
    recipient = auth0Session?.user.email.toLowerCase();
  } else if (ethSession.siwe?.data.address) {
    recipient = `did:ethr:${ethSession.siwe?.data.address}`.toLowerCase();
  }
  return recipient;
};

export type MyProfileRes = {
  bio: string;
  links: { username: string; type: string; isPublic: boolean; id: string }[];
};

export type ProfileRes = {
  bio: string;
  links: { username: string; type: string; isPublic: boolean }[];
};

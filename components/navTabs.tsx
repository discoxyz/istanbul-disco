import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { usePathname } from "next/navigation";
import { ButtonLink } from "./v2/button";

export const NavTabs: FC = () => {
  const { isConnected } = useAccount();
  const pathname = usePathname();

  const _links = [
    {
      text: "Active Drops",
      path: "/",
      requiresConnection: false,
    },
    {
      text: "My Drops",
      path: "/my-drops",
      requiresConnection: true,
    },
    // {
    //   text: "My Claims",
    //   path: "/my-claims",
    //   requiresConnection: true,
    // },
  ];

  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    const l = _links;
    l.filter((l) => isConnected || !l.requiresConnection);
    setLinks(l);
  }, [isConnected]);

  return (
    <nav>
      <ol className="mb-6 flex h-16 items-center px-6 text-base text-white/60 md:text-lg lg:text-2xl">
        {links.map((l, key) => {
          if (l.requiresConnection && !isConnected) return null;
          return (
            <li
              key={key}
              className={`mr-5 ${
                pathname === l.path && "text-white"
              } transition-all hover:text-white`}
            >
              <Link href={l.path}>{l.text}</Link>
            </li>
          );
        })}
        {isConnected && <li className="ml-auto"><ButtonLink href='/my-drops/create'>Create drop</ButtonLink></li>}
      </ol>
    </nav>
  );
};

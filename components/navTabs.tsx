import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { usePathname } from "next/navigation";

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
    {
      text: "My Claims",
      path: "/my-claims",
      requiresConnection: true,
    },
  ];

  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    const l = _links
    l.filter(l => isConnected || !l.requiresConnection )
    setLinks(l);
  }, [isConnected]);

  return (
    <nav>
      <ol className="flex space-x-5 text-2xl text-white/60 mb-6 px-6 h-16 items-center">
        {links.map((l, key) => {
          if (l.requiresConnection && !isConnected) return null;
          return (
            <li
              key={key}
              className={`${
                pathname === l.path && "text-white"
              } hover:text-white transition-all`}
            >
              <Link href={l.path}>{l.text}</Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

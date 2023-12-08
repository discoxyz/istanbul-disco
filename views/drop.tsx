"use client";
import { usePathname } from "next/navigation";
// import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Address, usePublicClient } from "wagmi";
import { useAuth } from "../contexts/authProvider";
import { Button2 } from "../components/button";
import { Card } from "../components/card";
import { Credential } from "../components/credCard";
import { useLoginModal, useShareModal } from "../contexts/modalProvider";
import { truncateAddress } from "../lib/truncateAddress";
import { compare } from "../lib/compare";
import { getEnsAddress } from "viem/ens";
import Link from "next/link";
import { parseAccountLink } from "../lib/parseAccountLink";
import { Spinner } from "../components/spinner";

export const DropView = () => {
  const publicClient = usePublicClient();
  const { authenticated, loading, address } = useAuth();
  const { open: openShare } = useShareModal();
  const { open: openLogin, isOpen } = useLoginModal();
  const pathname = usePathname();

  const ethAddressRegex = new RegExp(/^0x[A-Fa-f0-9]{40}$/);
  const ensRegex = new RegExp(
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
  );
  const emailRegex = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);

  useEffect(() => {
    if (!isOpen) {
      localStorage.removeItem("irl_callback");
    }
  }, [isOpen]);

  const [profile, setProfile] = useState<{
    loading: boolean;
    name?: string;
    address?: string;
    bio?: string;
    status?: {
      claimedYours: boolean;
      youClaimed: boolean;
    };
    links?: {
      username: string;
      type: string;
      isPublic: boolean;
    }[];
  }>({
    loading: true,
  });

  useEffect(() => {
    const handler = async (): Promise<{
      name: string;
      address: string;
      error: boolean;
    }> => {
      if (!publicClient)
        return {
          name: "",
          address: "",
          error: true,
        };
      if (!pathname) throw new Error("Page must have a pathname");
      const parsedPath = decodeURIComponent((
        typeof pathname === "string" ? pathname : pathname[0]
      ).replaceAll("/", ""))

      const _ethAddr = ethAddressRegex.exec(parsedPath);
      const ensAddr = ensRegex.exec(parsedPath);
      const email = emailRegex.exec(parsedPath);
      let name = parsedPath;
      let address = parsedPath;
      if (_ethAddr) {
        name = truncateAddress(_ethAddr[0] as Address) as string;
        address = _ethAddr[0];
      } else if (email) {
        name = email[0];
        address = email[0];
      } else if (ensAddr) {
        const ens = await getEnsAddress(publicClient, { name: ensAddr[0] });
        if (ens) {
          name = ensAddr[0];
          address = ens;
        }
      } else {
        return {
          name,
          address,
          error: true,
        };
      }
      return {
        name,
        address,
        error: false,
      };
    };

    const fetchProfile = async () => {
      const { name, address } = await handler();
      const result = await fetch("/api/profile/", {
        method: "POST",
        body: JSON.stringify({
          address: address,
        }),
      });
      const profile = await result.json();
      setProfile({
        loading: false,
        name: name,
        address: address,
        bio: profile.bio || "",
        links: profile.links,
        status: profile.status,
      });
    };
    fetchProfile();
  }, [publicClient, pathname]);

  const [isClaiming, setIsClaiming] = useState(false);

  const claim = useCallback(
    async (args?: { address: string }) => {
      const handler = async () => {
        const claimant = args?.address || address;
        if (!claimant || !profile.address) return;
        setIsClaiming(true);
        // setHasClaimed({
        //   claimed: false,
        //   claiming: true,
        //   loading: false,
        // });
        await fetch("/api/claim", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            owner: profile.address,
            claimant,
          }),
        });
        setIsClaiming(false);
        setProfile({
          ...profile,
          status: {
            claimedYours: profile.status?.claimedYours || false,
            youClaimed: true,
          },
        });
      };
      handler();
    },
    [profile, address],
  );

  return (
    <div>
      <main className="mx-auto mb-auto w-full">
        <Credential
          image={undefined}
          title={"We met IRL"}
          textColor={undefined}
          data={JSON.parse("{}")}
          className="col-span-5 mb-6 sm:col-span-3 md:col-span-2"
          createdByAddress={profile.name || undefined}
        />
        {profile.loading ? (
          <Card className="mb-2 flex aspect-video items-center justify-center animate-fadeIn">
            <Spinner
              sizeClassName="h-6 w-6"
              fillClassName="fill-zinc-800 dark:fill-grey-200"
            />
          </Card>
        ) : address && profile.address && compare(address, profile.address) ? (
          <Card className="mb-2 grid grid-cols-1 gap-3 animate-fadeIn dark:text-white text-black">
            <h1 className="text-lg font-medium text-black dark:text-white">
              Share your link
            </h1>
            <p className="text-lg text-black dark:text-white/80">
              Invite others to claim that they met you using your link:
            </p>
            <Button2
              variant="primary"
              loading={profile.loading}
              onClick={openShare}
            >
              {"Share your claim link"}
            </Button2>
          </Card>
        ) : profile.status?.youClaimed && profile.status.claimedYours ? (
          <Card className={`mb-2 grid grid-cols-1 gap-3 animate-fadeIn`}>
            <h1 className="text-lg font-medium text-black dark:text-white">
              It's mutal with {profile.name} 🤝
            </h1>
          </Card>
        ) : !profile.status?.youClaimed || !authenticated ? (
          <Card className={`mb-2 grid grid-cols-1 gap-3 animate-fadeIn dark:text-white text-black`}>
            <h1 className="text-lg font-medium text-black dark:text-white">
              {profile.status?.claimedYours
                ? `${profile.name} said that they met you. Make it mutual?`
                : `Claim that you met ${profile.name}`}
            </h1>
            {!authenticated ? (
              <Button2
                onClick={() => {
                  openLogin();
                  if (profile.address) {
                    localStorage.setItem("irl_callback", profile.address);
                  }
                }}
                className="w-full"
                variant={"primary"}
              >
                Log In
              </Button2>
            ) : (
              <Button2
                variant="primary"
                disabled={profile.loading || isClaiming}
                loading={profile.loading || isClaiming}
                onClick={() => address && claim({ address })}
                className="w-full"
              >
                {isClaiming
                  ? "Claiming"
                  : profile.loading
                  ? "Loading"
                  : "Claim"}
              </Button2>
            )}
          </Card>
        ) : (
          <Card className="mb-2 grid grid-cols-1 gap-3 animate-fadeIn dark:text-white text-black">
            <h1 className="text-lg font-medium text-black dark:text-white">
              You met {profile.name}
            </h1>
            {/* <p className="text-lg text-black dark:text-white/80">
              
            </p> */}
            <Button2
              variant="primary"
              className="w-full"
              loading={isClaiming}
              onClick={openShare}
            >
              Make things mutual
            </Button2>
            {!isClaiming && (
              <Link href="/" className="w-full">
                <Button2
                  variant="secondary"
                  className="w-full"
                  // loading={hasClaimed.loading}
                >
                  View my rolodex (size matters)
                </Button2>
              </Link>
            )}
          </Card>
        )}
        {!profile.loading ? (
          <Card className={`mb-2 grid grid-cols-1 gap-1 animate-fadeIn dark:text-white text-black`}>
            <h2 className="mt-2 text-lg opacity-60">Bio</h2>
            <p className="text-lg opacity-80 mb-3">{profile.bio || "No bio set"}</p>
            <h2 className="text-lg opacity-60">Account Links</h2>
            <div>
              {!profile?.links?.length ? (
                <span className="border-1 mb-2 mr-2 inline-flex rounded-full bg-black/10 dark:bg-white/10 px-4 py-2 italic">
                  No links set
                </span>
              ) : (
                profile?.links?.map((l, i) => {
                  const { href, valid, username, type } = parseAccountLink(
                    l.type,
                    l.username,
                  );
                  if (!valid) return;
                  return (
                    <a
                    key={i}
                    className="border-1 mb-2 mr-2 inline-flex items-center rounded-full  dark:bg-white/10 bg-black/10 px-4 py-2 dark:hover:bg-white/20 hover:bg-black/20"
                    href={href}
                  >
                      {username}
                    </a>
                  );
                })
              )}
            </div>
          </Card>
        ) : (
          <></>
        )}
      </main>
    </div>
  );
};

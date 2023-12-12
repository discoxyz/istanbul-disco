"use client";

import { FC, useCallback, useEffect } from "react";
import { useAuth } from "../contexts/authProvider";
import { Card } from "../components/card";
import { Button2 } from "../components/button";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";

import { Tabs } from "../components/tabs";
import Image from "next/image";
import { useLoginModal, useShareModal } from "../contexts/modalProvider";
import Link from "next/link";
import { Spinner } from "../components/spinner";
import { ClaimsProvider, useClaims } from "../contexts/claimsProvider";
import { useRouter } from "next/navigation";

// Create formatter (English).
TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

const ResultsTab: FC<{
  type: "myClaims" | "claimedMine";
}> = ({ type }) => {
  const router = useRouter();
  const {
    getMyClaims,
    getClaimedMine,
    loading,
    data,
    page,
    hasNextPage,
    hasPrevPage,
  } = useClaims();

  useEffect(() => {
    if (!window) return;
    const irlCallback = localStorage.getItem("irl_callback");
    if (irlCallback) {
      router.push(`/${irlCallback}`);
    }
    return;
  }, [window]);

  const handleGetMyClaims = useCallback(() => {
    getMyClaims();
  }, [getMyClaims]);

  const handleGetClaimedMine = useCallback(() => {
    getClaimedMine();
  }, [getClaimedMine]);

  useEffect(() => {
    if (type === "myClaims") {
      handleGetMyClaims();
    } else {
      handleGetClaimedMine();
    }
  }, [type]);

  function getPage(page: number) {
    if (type === "myClaims") {
      getMyClaims(page);
    } else {
      getClaimedMine(page);
    }
  }

  if (loading)
    return <Spinner sizeClassName="w-6 h-6" fillClassName="pill-pink" />;

  if (!data?.length) {
    return (
      <div className="flex rounded-3xl bg-indigo-500/50 px-4">
        <Image
          src={"/images/traveller.png"}
          alt="Woman looking at map"
          width={250}
          height={300}
          className="w-2/3"
        />
        <p className="mt-8 text-right font-medium">Lost in istanbul, anon?</p>
      </div>
    );
  }
  return (
    <>
      <table className="table w-full text-base text-slate-900 dark:text-gray-50">
        <tbody>
          {data?.map((data, i) => (
            <tr
              key={i}
              className="borde table-row border-b border-b-slate-200 last-of-type:border-none dark:border-white/10"
            >
              <td className="table-cell  py-4">
                <Link href={`/${data.address}`}>{data.name}</Link>
              </td>
              <td className="table-cell  py-4 text-right">
                {timeAgo.format(new Date(data.time))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex">
        {hasPrevPage && (
          <Button2
            onClick={() => getPage((page || 1) - 1)}
            className="mr-auto"
            variant="secondary"
            size="small"
          >
            Previous
          </Button2>
        )}
        {hasNextPage && (
          <Button2
            onClick={() => getPage((page || 0) + 1)}
            className="ml-auto"
            variant="secondary"
            size="small"
          >
            Next
          </Button2>
        )}
      </div>
    </>
  );
};

function Profile() {
  const { open: openShare } = useShareModal();
  const { open: openLogin } = useLoginModal();
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="my-auto flex h-full w-full items-center justify-center">
        <Spinner
          sizeClassName="h-6 w-6"
          fillClassName="fill-zinc-800 dark:fill-grey-200"
        />
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-screen-xl">
      {!authenticated && (
        <Image
          width={600}
          height={600}
          alt="Man and woman dancing"
          src={"/images/dancing.png"}
        />
      )}

      {!authenticated && (
        <Card className="mb-6 grid grid-cols-1 gap-3">
          <h1 className="text-lg font-medium text-black dark:text-white">
            Get your met IRL link
          </h1>
          <p className="text-lg text-black dark:text-white/80">
            Share your link and build your social graph
          </p>
          <Button2
            onClick={openLogin}
            className="ml-auto w-full"
            variant={"primary"}
          >
            Log in
          </Button2>
        </Card>
      )}

      {authenticated && (
        <>
          <Card className="mb-6 grid grid-cols-1 gap-3">
            <h1 className="text-lg font-medium text-black dark:text-white">
              Your met IRL link
            </h1>
            <p className="text-lg text-black dark:text-white/80">
              Share your link and build your social graph
            </p>
            <Button2 onClick={openShare} className="w-fit">
              Share link
            </Button2>
          </Card>
          <ClaimsProvider>
            <Card className="mb-6">
              <Tabs
                tabs={[
                  {
                    label: "I met",
                    path: "/imet",
                    content: <ResultsTab type="myClaims" />,
                  },
                  {
                    label: "Met me",
                    path: "/imet",
                    content: <ResultsTab type="claimedMine" />,
                  },
                ]}
              />
            </Card>
          </ClaimsProvider>
        </>
      )}
    </div>
  );
}

export default Profile;

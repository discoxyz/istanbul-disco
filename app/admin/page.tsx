"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { Address, useAccount, useSignMessage } from "wagmi";
import { redirect } from "next/navigation";
import { Button } from "../../components/v2/button";
import {
  ToastError,
  ToastLoading,
  ToastSuccess,
} from "../../components/v2/toast";
import { truncateAddress } from "../../lib/truncateAddress";
// import { useState } from "react";

// // This gets called on every request
// async function getData() {
//   // Fetch data from external API
//   const res = await fetch(`http://localhost:3000/api/v2/drops/getAll`, {
//     method: "GET",
//   });
//   const data = await res.json();

//   // Pass data to the page via props
//   return { props: { data } };
// }

export default function Page() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticated, setIsAuthentated] = useState(false);
  // const [value, setValue] = useState<number | undefined>();
  useEffect(() => {
    if (!isConnected) {
      redirect("/");
    }
  }, [address, isConnected]);

  const fetchAuth = async (sig: string) => {
    const fetchAuth = await fetch("/api/v2/admin/sign-in", {
      method: "POST",
      body: JSON.stringify({
        signature: sig,
      }),
    });
    const auth = await fetchAuth.json();
    return auth;
  };

  const signIn = useCallback(async () => {
    const sig = await signMessageAsync({ message: "I am authenticating" });
    const res = await fetchAuth(sig);
    setIsAuthentated(res.authenticated || false);
  }, [signMessageAsync]);

  const fetchDelete = async (sig: `0x${string}`, dropId: number) => {
    if (!dropId) {
      console.error("No drop ID");
    }
    if (!sig) {
      console.error("No signature");
    }

    if (!sig || !dropId) return;

    const data = {
      dropId: dropId,
      signature: sig,
    };

    const fetchAuth = await fetch("/api/v2/admin/delete-drop", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (fetchAuth.ok) {
      const auth = await fetchAuth.json();
      return auth;
    } else {
      console.error(fetchAuth);
      return { deleted: false };
    }
  };
  const [deleteState, setDeleteState] = useState<
    "delete" | "deleting" | "deleted" | "error"
  >("delete");

  const downloadClaims = useCallback(async () => {
    const sig = await signMessageAsync({
      message: `Get all claims from disco`,
    });
    await fetchClaims(sig);
  }, [signMessageAsync]);

  const fetchClaims = async (signature: `0x${string}`) => {
    if (!signature) {
      console.error("No signature");
    }
    const res = await fetch("/api/v2/admin/get-claims", {
      method: "POST",
      body: JSON.stringify({
        signature,
      }),
    });

    const blob = await res.blob();
    const url = await URL.createObjectURL(blob);
    window.open(url, "_blank");
    URL.revokeObjectURL(url);
    return;
  };

  const deleteDrop = useCallback(async (dropId: number) => {
    if (dropId) {
      setDeleteState("deleting");
      const sig = await signMessageAsync({
        message: `Delete drop ID ${dropId}`,
      });
      const del = await fetchDelete(sig, dropId);
      setDeleteState(del.deleted ? "deleted" : "error");
    }
  }, [signMessageAsync]);

  interface DropData {
    drops: number;
    claims: number;
    users: number;
    dropList: {
      createdByAddress: string;
      id: number;
      name: string;
      path: string;
      _count: {
        claims: number;
      };
    }[];
    dropCreators: {
      [key: string]: number;
    };
  }

  const [dropData, setDropData] = useState<DropData>({
    drops: 0,
    claims: 0,
    users: 0,
    dropList: [],
    dropCreators: {},
  });

  const [dropPage, setDropPage] = useState({
    pages: 1,
    currentPage: 0,
  });

  const [creatorPage, setCreatorPage] = useState({
    pages: 1,
    currentPage: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const counts = await fetch("/api/v2/admin/get-counts");
      const res = await counts.json();
      setDropData(
        res.data || {
          drops: 0,
          claims: 0,
          users: 0,
          dropList: [],
          dropCreators: {},
        },
      );
      setDropData(res.data);
    };
    fetchData();
    const interval = setInterval(() => {
      if (isConnected) {
        fetchData();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDropPage({
      ...dropPage,
      pages: Math.ceil((dropData.dropList.length) / 15),
    });
    setCreatorPage({
      ...creatorPage,
      pages: Math.ceil((Object.keys(dropData.dropCreators).length) / 15),
    });
  }, [dropData]);

  const handlePage = useCallback(
    (page: number) => {
      setDropPage({
        ...dropPage,
        currentPage: page,
      });
    },
    [dropPage],
  );

  const handleCreatorPage = useCallback(
    (page: number) => {
      setCreatorPage({
        ...creatorPage,
        currentPage: page,
      });
    },
    [creatorPage],
  );

  return (
    <>
      <main className="mx-auto mb-auto w-full max-w-4xl">
        <h1 className="mb-10 text-3xl">Admin</h1>
        {!isAuthenticated ? (
          <Button onClick={signIn}>Sign in</Button>
        ) : (
          <>
            <div className="mb-20 flex w-full justify-stretch space-x-5">
              <div className="flex-1 rounded-md border border-white/10 p-5">
                <h2 className="opacity-60">Drops</h2>
                <p className="text-mono text-3xl">{dropData.drops}</p>
              </div>
              <div className="flex-1 rounded-md border border-white/10 p-5">
                <h2 className="opacity-60">Claims</h2>
                <p className="text-mono text-3xl">{dropData.claims}</p>
              </div>
              <div className="flex-1 rounded-md border border-white/10 p-5">
                <h2 className="opacity-60">Connected Addresses</h2>
                <p className="text-mono text-3xl">{dropData.users}</p>
              </div>
            </div>

            <div className="mb-20 w-full rounded-md border border-white/10 p-5">
              <h2 className="mb-2 opacity-60">Top Creators</h2>
              <table className="text-md w-full border-separate border-spacing-2 opacity-60">
                <tr className="text-left">
                  <th>Address</th>
                  <th>Total Claims on Created Drops</th>
                </tr>
                {Object.keys(dropData.dropCreators).map((k, i) => {
                  if (i < dropPage.currentPage * 15) return
                  if (i > (dropPage.currentPage + 1) * 15) return
                  return (
                    <tr key={i} className="p-2">
                      <td>{k}</td>
                      <td>{dropData.dropCreators[k]}</td>
                    </tr>
                  );
                })}
              </table>
              <div className='my-4 flex w-full justify-center'>
                {[...Array(creatorPage.pages)].map((e, i) => (
                  <a
                    className={`px-3 py-2 cursor-pointer bg-white/10 rounded-md mx-2  hover:bg-white/20 hover:text-white transition-all ${
                      creatorPage.currentPage === i
                        ? "text-white bg-white/20"
                        : "text-white/60"
                    }`}
                    onClick={() => handleCreatorPage(i)}
                  >
                    {i + 1}
                  </a>
                ))}
              </div>
            </div>

            <div className="w-full rounded-md border border-white/10 p-5 mb-20">
              <h2 className="opacity-60">All drops</h2>
              <table className="text-md w-full border-separate border-spacing-2">
                <tr className="text-left">
                  <th>Created by</th>
                  <th>Drop Name</th>
                  <th className="text-left">Drop ID</th>
                  <th>Claims</th>
                  <th>Manage</th>
                  <th>Link</th>
                </tr>
                {dropData.dropList.map((d, i) => {
                  if (i < dropPage.currentPage * 15) return
                  if (i > (dropPage.currentPage + 1) * 15) return
                  return (
                    <tr
                      key={i}
                      className="group text-white/60 hover:text-white/80"
                    >
                      <td className=" py-2">
                        {truncateAddress(d.createdByAddress as Address)}
                      </td>
                      <td>{d.name}</td>
                      <td>{d.id}</td>
                      <td>{d._count.claims}</td>
                      <td><button onClick={() => deleteDrop(d.id)}>Delete</button></td>
                      <td>
                        <a
                          href={`/${d.path}`}
                          className="rounded px-4 py-2 underline hover:bg-white/10 hover:text-white"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </table>
              <div className='my-4 flex w-full justify-center'>
                {[...Array(dropPage.pages)].map((e, i) => (
                  <a
                    className={`px-3 py-2 cursor-pointer bg-white/10 rounded-md mx-2  hover:bg-white/20 hover:text-white transition-all ${
                      dropPage.currentPage === i
                        ? "text-white bg-white/20"
                        : "text-white/60"
                    }`}
                    onClick={() => handlePage(i)}
                  >
                    {i + 1}
                  </a>
                ))}
              </div>
            </div>

            <div className="mb-20 w-full rounded-md border border-white/10 p-5">
              <h2 className="opacity-60">Download:</h2>
              <Button onClick={downloadClaims}>All completed claims</Button>
            </div>
          </>
        )}
        <div className="fixed bottom-0 left-0 right-0 w-full">
          {deleteState == "deleted" ? (
            <ToastSuccess
              text="Drop deleted"
              onDismiss={() => {
                setDeleteState("delete");
              }}
            />
          ) : deleteState == "deleting" ? (
            <ToastLoading text="Deleting" />
          ) : (
            deleteState == "error" && (
              <ToastError
                text="Error deleting drop"
                onDismiss={() => {
                  setDeleteState("delete");
                }}
              />
            )
          )}
        </div>
      </main>
    </>
  );
}

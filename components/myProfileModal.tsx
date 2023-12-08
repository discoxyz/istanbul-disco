import { FC, useCallback, useEffect, useState } from "react";
import { Card } from "./card";
import { Button2 } from "./button";
import { useAuth } from "../contexts/authProvider";
import {
  EyeIcon,
  EyeSlashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useProfileModal } from "../contexts/modalProvider";
import { AccountLinkCreate, AddAccountLink } from "./addAccountLink";
import { MyProfileRes } from "../lib/api/getUser";
import { parseAccountLink } from "../lib/parseAccountLink";
import Link from "next/link";
import { Spinner } from "./spinner";

export const MyProfileModal: FC = () => {
  const { authenticated, logout, address } = useAuth();
  const { isOpen, isOpening, isClosing, close } = useProfileModal();
  // const [newAccountLink, setNewAccountLink] = useState<AccountLinkCreate>();
  const [profile, setProfile] = useState<MyProfileRes & { isLoading: boolean }>(
    {
      bio: "",
      links: [],
      isLoading: true,
    },
  );

  const [loadingLinks, setLoadingLinks] = useState<string[]>([]);

  const getProfile = async () => {
    const profile = await fetch("/api/manage/profile/", {
      method: "GET",
    });
    const prof = (await profile.json()) as MyProfileRes;
    setProfile({ ...prof, isLoading: false });
  };

  useEffect(() => {
    if (isOpen || isOpening) return;
    getProfile();
  }, [isOpen, isOpening]);

  useEffect(() => {
    if (!authenticated && isOpen) {
      close();
    }
  }, [authenticated, isOpen, isOpening]);

  // const [isEditingBio, setIsEditingBio] = useState(false);
  // const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLink, setNewLink] = useState<{
    value: AccountLinkCreate;
    isOpen: boolean;
    isSaving: boolean;
    error?: string;
  }>({
    value: {},
    isOpen: false,
    isSaving: false,
  });

  const [newBio, setNewBio] = useState<{
    value: string;
    isOpen: boolean;
    isSaving: boolean;
    error?: string;
  }>({
    value: "",
    isOpen: false,
    isSaving: false,
  });

  useEffect(() => {
    setNewBio({
      value: profile.bio,
      isOpen: false,
      isSaving: false,
    });
  }, [profile.bio]);

  const handleSaveLink = useCallback(async () => {
    setNewLink({
      ...newLink,
      error: undefined,
    });
    if (!newLink.value?.valid) {
      setNewLink({
        ...newLink,
        error: "Account link is invalid",
      });
      return;
    }
    if (!newLink.value?.username) {
      setNewLink({
        ...newLink,
        error: "Username cannot be empty",
      });
      return;
    }

    if (!newLink.value?.type) {
      setNewLink({
        ...newLink,
        error: "Type cannot be empty",
      });
      return;
    }

    try {
      const { username, type, valid } = parseAccountLink(
        newLink.value.type,
        newLink.value.username,
      );
      if (!valid) {
        setNewLink({
          ...newLink,
          error: "Username cannot contain special characters or spaces.",
        });
        return;
      }

      setNewLink({
        ...newLink,
        isSaving: true,
      });

      const response = await fetch("/api/manage/account_link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          type,
        }),
      });

      const createdLink = await response.json();

      setNewLink({
        value: {},
        isOpen: false,
        isSaving: false,
      });
      setProfile({
        ...profile,
        links: [...(profile?.links || []), createdLink],
      });
    } catch (err) {
      setNewLink({
        ...newLink,
        isSaving: false,
        error: "Something went wrong when saving",
      });
      console.error(err);
    }
  }, [newLink, profile]);

  const handleSaveBio = useCallback(async () => {
    setNewBio({
      ...newBio,
      error: undefined,
      isSaving: true,
    });
    try {
      await fetch("/api/manage/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio: newBio.value || "",
        }),
      });
      setNewBio({
        ...newBio,
        isOpen: false,
        isSaving: false,
      });
      setProfile({
        ...profile,
        bio: newBio.value,
      });
    } catch (err) {
      setNewBio({
        ...newBio,
        isSaving: false,
        error: "Something went wrong when saving",
      });
      console.error(err);
    }
  }, [profile, newBio]);

  const changeVisibility = useCallback(
    async (id: string, visible: boolean) => {
      setLoadingLinks([...loadingLinks, id]);
      try {
        await fetch("api/manage/make_visible/", {
          method: "POST",
          body: JSON.stringify({
            id: id,
            visible,
          }),
        });
      } catch (err) {
        console.error("Something went wrong when toggling visibility");
        setLoadingLinks(loadingLinks.filter((l) => l !== id));
        return;
      }
      const links = profile.links.map((l) => ({
        ...l,
        isPublic: l.id === id ? !l.isPublic : l.isPublic,
      }));
      setLoadingLinks(loadingLinks.filter((l) => l !== id));
      setProfile({ ...profile, links });
    },
    [loadingLinks, profile],
  );

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 top-0 z-50 h-full w-full transition-all ${
        isOpen || isOpening
          ? "bg-indigo-900/10 backdrop-blur-xl"
          : "bg-transparent"
      } ${!isOpen && !isOpening && "invisible"}`}
    >
      <Card
        className="fixed bottom-4 left-4 right-4 mx-auto max-w-lg shadow-lg"
        style={{
          transition: "all ease-in-out 0.4s",
          transform: `translateY(${
            (isOpen || isOpening) && !isClosing ? "0%" : "120%"
          })`,
        }}
      >
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h1 className="medium text-2xl font-medium text-black dark:text-white">
              My profile
            </h1>
            <button
              onClick={close}
              className="-mr-3 -mt-3 rounded-full p-2 transition-all hover:bg-slate-200 dark:hover:bg-slate-200/10"
            >
              <XCircleIcon className="h-8 w-8 stroke-black/50 dark:stroke-white/50" />
            </button>
          </div>
          {profile.isLoading ? (
            <div className="mb-4 flex w-full flex-col items-center justify-center rounded-xl border border-indigo-900/20 p-6 py-16 dark:border-white/20">
              <Spinner
                sizeClassName="w-6 h-6"
                fillClassName="fill-zinc-800 dark:fill-grey-200"
              />
              <p className="mt-2 opacity-40">Profile loading</p>
            </div>
          ) : (
            <div className="mb-4 w-full rounded-xl border border-indigo-900/20 p-6 dark:border-white/20">
              <div className="mb-2 flex w-full justify-between text-lg">
                <h2 className="mt-2 text-lg opacity-60">My Bio</h2>
                <button
                  disabled={newBio.isSaving}
                  onClick={() =>
                    setNewBio({
                      value: profile.bio,
                      isSaving: false,
                      isOpen: !newBio.isOpen,
                    })
                  }
                >
                  {newBio.isSaving
                    ? "Saving..."
                    : newBio.isOpen
                    ? "Cancel"
                    : "Edit"}
                </button>
              </div>
              {newBio.isOpen ? (
                <div>
                  <textarea
                    value={newBio.value}
                    onChange={(e) =>
                      setNewBio({ ...newBio, value: e.currentTarget.value })
                    }
                  />
                  <Button2
                    className="ml-auto mt-2"
                    onClick={handleSaveBio}
                    disabled={newBio.value === profile.bio || newBio.isSaving}
                  >
                    {newBio.isSaving ? "Saving..." : "Save bio"}
                  </Button2>
                </div>
              ) : (
                <p className="text-lg opacity-80">{profile.bio}</p>
              )}
            </div>
          )}
          {profile.isLoading ? (
            <div className="mb-4 flex w-full flex-col items-center justify-center rounded-xl border border-indigo-900/20 p-6 py-16 dark:border-white/20">
              <Spinner
                sizeClassName="w-6 h-6"
                fillClassName="fill-zinc-800 dark:fill-grey-200"
              />
              <p className="mt-2 opacity-40">Links loading</p>
            </div>
          ) : (
            <div className="mb-4 w-full rounded-xl border border-indigo-900/20 p-6 dark:border-white/20 ">
              <div>
                <div className="mb-2 flex w-full justify-between text-lg">
                  <h2 className="mt-2 text-lg opacity-60">My Account Links</h2>
                  <button
                    disabled={newLink.isSaving}
                    onClick={() => {
                      setNewLink({
                        isOpen: !newLink.isOpen,
                        isSaving: false,
                        value: {},
                      });
                    }}
                  >
                    {newLink.isSaving
                      ? "Saving"
                      : newLink.isOpen
                      ? "Cancel"
                      : "Add"}
                  </button>
                </div>
                {newLink.isOpen ? (
                  <div className="w-full">
                    <AddAccountLink
                      callback={(args: {
                        username?: string;
                        type?: string;
                        valid?: boolean;
                      }) =>
                        setNewLink({
                          value: args,
                          isSaving: false,
                          isOpen: true,
                        })
                      }
                    />
                    <Button2
                      className="ml-auto mt-2"
                      onClick={handleSaveLink}
                      disabled={!newLink?.value.valid || newLink.isSaving}
                    >
                      Add link
                    </Button2>
                  </div>
                ) : (
                  profile?.links.map((l, i) => {
                    const { href, valid, username } = parseAccountLink(
                      l.type,
                      l.username,
                    );
                    if (!valid) return;
                    return (
                      <a
                        key={i}
                        className="border-1 mb-2 mr-2 inline-flex items-center rounded-full border-black bg-white/10 px-4 py-0.5 pr-0.5 hover:bg-white/20"
                        href={href}
                      >
                        {username}
                        {loadingLinks?.includes(l.id) ? (
                          <Spinner
                            sizeClassName="w-6 h-6 ml-3"
                            fillClassName="fill-zinc-800 dark:fill-grey-200"
                          />
                        ) : (
                          <button
                            className="group ml-3 rounded-full bg-white/10 p-1.5 hover:bg-white/20"
                            onClick={(e) => {
                              changeVisibility(l.id, !l.isPublic);
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                          >
                            {l.isPublic ? (
                              <EyeIcon className="h-6 w-6 opacity-40 group-hover:fill-purple-700 group-hover:opacity-100" />
                            ) : (
                              <EyeSlashIcon className="h-6 w-6 opacity-40 group-hover:fill-purple-700 group-hover:opacity-100" />
                            )}
                          </button>
                        )}
                      </a>
                    );
                  })
                )}
                <div className="mt-4">
                  <p className="mb-2 flex items-center justify-start opacity-60">
                    <EyeSlashIcon className="mr-2 h-6 w-6 flex-shrink-0 opacity-80" />
                    Hidden links will only be visible to mutual connections
                  </p>
                  <p className="flex items-center opacity-60">
                    <EyeIcon className="mr-2 h-6 w-6 flex-shrink-0 opacity-80" />
                    Visible links are visible to all
                  </p>
                </div>
                {/* <button className="border-1 mb-2 mr-2 flex rounded-full border-black bg-white/10 px-4 py-2">
                Add Link <PlusIcon className="ml-3 h-6 w-6 opacity-40" />
              </button> */}
              </div>
            </div>
          )}
          {/* <EditProfile profile={profile || { bio: "", links: [] }} /> */}
          <div className="flex w-full justify-between">
            <a href="/api/auth/logout">
              <Button2 onClick={() => logout()} variant="secondary">
                Log out
              </Button2>
            </a>
            <Link href={`/${address}`}>
              <Button2 onClick={() => close()}>View Profile</Button2>
            </Link>
          </div>
        </div>
        {/* </div> */}
      </Card>
    </div>
  );
};

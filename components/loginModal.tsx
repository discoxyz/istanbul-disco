import { FC } from "react";
import { Card } from "./card";
import { Button2 } from "./button";
import { useAuth } from "../contexts/authProvider";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { useLoginModal } from "../contexts/modalProvider";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { useUser } from "@auth0/nextjs-auth0/client";

export const LoginModal: FC = () => {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { user } = useUser();
  const { authenticate, authenticated, logout } = useAuth();
  const { isOpen, isOpening, isClosing, close } = useLoginModal();

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 top-0 z-50 h-full w-full transition-all ${
        isOpen || isOpening
          ? "bg-indigo-900/10 backdrop-blur-xl"
          : "bg-transparent"
      } ${!isOpen && !isOpening && "invisible"}`}
    >
      <Card
        className="fixed bottom-4 left-4 right-4 max-w-lg shadow-lg"
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
              {authenticated ? "Log Out" : "Log In"}
            </h1>
            <button
              onClick={close}
              className="-mr-3 -mt-3 rounded-full p-2 transition-all hover:bg-slate-200 dark:hover:bg-slate-200/10"
            >
              <XCircleIcon className="h-8 w-8 stroke-black/50 dark:stroke-white/50" />
            </button>
          </div>
          <div className="mb-4 w-full rounded-xl border border-indigo-900/20 p-6 dark:border-white/20">
            {authenticated ? (
              !user ? (
                <Button2 onClick={() => logout()} className="mb-4 mt-2 w-full">
                  Log out
                </Button2>
              ) : (
                <a href="/api/auth/logout">
                  <Button2 className='w-full'>Log out</Button2>
                </a>
              )
            ) : !isConnected ? (
              <>
                <a href="/api/auth/login">
                  <Button2 onClick={() => null} className="mb-4 mt-2 w-full">
                    Log in with email
                  </Button2>
                </a>
                <h2 className="mb-2 text-xl opacity-80">For web3 users:</h2>
                <Button2 onClick={openConnectModal} className="w-full">
                  Connect Wallet
                </Button2>
              </>
            ) : (
              <>
                <Button2
                  onClick={() => disconnect()}
                  variant="secondary"
                  className="mb-2 w-full"
                >
                  Disconnect
                </Button2>
                <Button2 onClick={() => authenticate()}>Sign message</Button2>
              </>
            )}
          </div>
          <div className="flex w-full justify-end">
            {/* <Button2 onClick={copy} variant="secondary">
              {!copied ? "Copy link" : "Copied"}
            </Button2> */}
          </div>
        </div>
      </Card>
    </div>
  );
  // }
  // return;
};

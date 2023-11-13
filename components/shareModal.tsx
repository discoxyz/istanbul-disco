import { FC, useEffect, useState } from "react";
import { Card } from "./card";
import QRCode from "react-qr-code";
import { Button2 } from "./button";
import { useAuth } from "../contexts/authProvider";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { useShareModal } from "../contexts/modalProvider";

export const ShareModal: FC = () => {
  const { address, name } = useAuth();
  const [canShare, setCanShare] = useState(false);
  const [copied, setHasCopied] = useState(false);
  const { isOpen, isOpening, isClosing, close } = useShareModal();
  const [shareData, setShareData] = useState({
    title: "Met IRL",
    text: "Claim that you met IRL",
    url: "https://metirl.disco.xyz/",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.host;
      const shareData = {
        title: "Met IRL",
        text: "Claim that you met IRL",
        url: `https://${hostname}/${address}`,
      };
      setShareData(shareData);

      if (navigator.canShare && navigator.canShare(shareData))
        setCanShare(true);
    }
  }, [address]);

  const share = () => {
    navigator.share(shareData);
  };
  const copy = () => {
    navigator.clipboard.writeText(shareData.url);
    setHasCopied(true);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 top-0 h-full w-full transition-all z-50 ${
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
              {name}
            </h1>
            <button
              onClick={close}
              className="-mr-3 -mt-3 rounded-full p-2 transition-all hover:bg-slate-200 dark:hover:bg-slate-200/10"
            >
              <XCircleIcon className="h-8 w-8 stroke-black/50 dark:stroke-white/50" />
            </button>
          </div>
          <div className="mb-4 w-full rounded-xl border border-indigo-900/20 p-6 dark:border-white/20">
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={shareData.url}
              bgColor="transparent"
              className="dark:invert"
              viewBox={`0 0 256 256`}
            />
          </div>
          <div className="flex w-full justify-end">
            <Button2 onClick={copy} variant="secondary">
              {!copied ? "Copy link" : "Copied"}
            </Button2>
            {canShare && (
              <Button2 onClick={share} className="ml-auto">
                Share
              </Button2>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
  // }
  // return;
};

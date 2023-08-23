"use client";

import { Prisma } from "@prisma/client";
import {
  CSSProperties,
  FC,
  HTMLProps,
  Key,
  OlHTMLAttributes,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { Credential } from "./credCard";
import { base } from "@rainbow-me/rainbowkit/dist/css/reset.css";
import { useAccount } from "wagmi";
import { Button } from "./button";
import { parseClaimStatus } from "../../lib/parseClaimStatus";

export const DropRow: FC<
  {
    drop: Prisma.DropGetPayload<{ include: { claims?: true } }>;
  } & HTMLProps<HTMLDivElement>
> = ({ drop, className, ...rest }) => {
  const { isConnected, address } = useAccount();
  const [eligible, setEligibile] = useState<boolean | undefined>();
  const [claimed, setClaimed] = useState<boolean | undefined>();
  useEffect(() => {
    // const claim = drop.claims?.filter((c) => c.address == address)[0];
    const { claimed, eligible } = parseClaimStatus(drop, address);
    setClaimed(claimed);
    setEligibile(eligible);
  }, [address, drop]);

  const tags: {
    color?: "positive" | "negative" | "neutral" | "disco";
    text: string;
  }[] = [];

  // let buttonArea: JSX.Element | undefined;

  if (!isConnected) {
    // Do nothing
  } else if (claimed) {
    tags.push({ color: "disco", text: "Claimed" });
  } else if (eligible) {
    tags.push({ color: "positive", text: "Eligible" });
  } else if (!eligible) {
    tags.push({ color: "negative", text: "Not eligible" });
  }
  if (address === drop.createdByAddress && !drop.visible) {
    tags.push({ color: "neutral", text: "Hidden from feed" });
  }
  if (address === drop.createdByAddress && drop.disabled) {
    tags.push({ color: "neutral", text: "Claiming disabled" });
  }

  return (
    <div
      className={`bg-stone-950 grid grid-cols-5 max-w-full p-6 rounded-2xl group transition-all hover:scale-105 ${className}`}
    >
      <Credential
        image={drop.image || undefined}
        title={drop.name}
        data={JSON.parse(drop.subjectData)}
        className="max-w-sm col-span-2"
        createdByAddress={drop.createdByAddress}
        {...rest}
      />
      <div className="flex-1 ml-6 flex flex-col py-2 relative z-10 col-span-3">
        <h1 className="text-2xl mb-2 transition-all">
          {drop.name}
          {claimed && <img className="inline ml-2" src="/icons/check.svg" />}
          {!eligible && <img className="inline ml-2" src="/icons/lock.svg" />}
        </h1>
        <p className="text-l opacity-60 mb-auto ">{drop.description}</p>
        <Tags tags={tags} />
      </div>
    </div>
  );
};

interface TagProp {
  color?: "positive" | "negative" | "neutral" | "disco";
  text: string;
}

const Tags: FC<{ tags: TagProp[] } & OlHTMLAttributes<HTMLOListElement>> = ({
  tags,
  ...rest
}) => {
  return (
    <ol {...rest}>
      {tags.map((tag: TagProp, key: Key) => {
        let classes =
          "px-2 py-1 inline-block  rounded-md mr-2 text-xs uppercase tracking-wider";
        if (tag.color === "positive") classes += " bg-green-800";
        if (tag.color === "negative") classes += " bg-red-800";
        if (tag.color === "disco") classes += " bg-purple-800";
        return (
          <li className={classes} key={key}>
            {tag.text}
          </li>
        );
      })}
    </ol>
  );
};

"use client";

import { Prisma } from "@prisma/client";
import {
  FC,
  HTMLProps,
  Key,
  OlHTMLAttributes,
  useEffect,
  useState,
} from "react";
import { Credential } from "./credCard";
import { useAccount } from "wagmi";
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
      className={`group grid max-w-full grid-cols-5 gap-x-6 rounded-2xl bg-stone-950 p-6 transition-all hover:scale-105 ${className}`}
    >
      <Credential
        image={drop.image || undefined}
        title={drop.name}
        textColor={drop.textColor || undefined}
        data={JSON.parse(drop.subjectData || "{}")}
        schema={drop.schema}
        className="col-span-5 sm:col-span-3 md:col-span-2"
        createdByAddress={drop.createdByAddress}
        {...rest}
      />
      <div className="relative z-10 col-span-5 flex flex-1 flex-col py-2 sm:col-span-2 md:col-span-3">
        <h1 className="mb-05 mt-4 text-xl transition-all lg:mb-2 lg:mt-0 lg:text-2xl">
          {drop.name}
          {claimed && <img className="ml-2 inline" src="/icons/check.svg" />}
          {!eligible && <img className="ml-2 inline" src="/icons/lock.svg" />}
        </h1>
        <p className="text-l mb-auto line-clamp-3 text-ellipsis opacity-60 ">
          {drop.description}
        </p>
        <Tags tags={tags} className="mt-2" />
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

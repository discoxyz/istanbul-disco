import React from "react";
import { FC, HTMLProps } from "react";

export interface CredentialCardProps {
  data: { [key: string]: any };
  image?: string;
  textColor?: string;
  title: string;
  createdByAddress?: string;
  schema?: string;
}

export const Credential: FC<
  CredentialCardProps & HTMLProps<HTMLDivElement>
> = ({
  title,
  className,
  textColor = "#FFFFFF",
  image = "https://fzt.aqp.mybluehost.me/images/bg_disco.png",
  createdByAddress,
  // ...rest
}) => {
  const baseUnit = (4 / 334) * 100 * 4 + "cqw";

  return (
    <div
      className={`flex flex-grow flex-wrap ${className} w-full`}
      style={
        {
          color: textColor,
          containerType: "inline-size",
          "--base-unit": baseUnit,
        } as React.CSSProperties
      }
    >
      <div
        className="relative aspect-video w-full flex-grow"
        style={{ containerType: "inline-size" }}
      >
        <div
          className=" flex h-full w-full flex-col bg-cover"
          style={{
            fontSize: "var(--base-unit)",
            padding: "1em",
            borderRadius: "1em",
            background: `linear-gradient(
          0deg,
          rgba(0, 0, 0, 0.2) 0%,
          rgba(0, 0, 0, 0.2) 100%
        ),
        radial-gradient(
          70.3% 70.3% at 50% 29.7%,
          rgba(255, 255, 255, 0.05) 0%,
          rgba(255, 255, 255, 0) 100%
        ),
        url(${image}) center center / cover no-repeat,
        linear-gradient(180deg, #4a3c58 0%, #393142 100%)`,
            boxShadow: "0px -9px 22px 0px rgba(0, 0, 0, 0.25) inset",
          }}
        >
          <h1 style={{ fontSize: "1.8em" }}>{title}</h1>
          {createdByAddress && (
            <>
              <h2
                className="mt-auto uppercase tracking-wider"
                style={{ fontSize: "0.8em" }}
              >
                From
              </h2>
              <p style={{ fontSize: "1.2em" }}>{createdByAddress}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

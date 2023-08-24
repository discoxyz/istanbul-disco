import { FC, HTMLProps, useEffect, useState } from "react";
import { Address } from "viem";
import { truncateAddress } from "../../lib/truncateAddress";
import { schemas } from "../../lib/schemas";
import { camelCase, startCase, toLower } from "lodash";

export interface CredentialCardProps {
  data: { [key: string]: any };
  image?: string;
  title: string;
  createdByAddress: string;
  schema?: string;
}

export const Credential: FC<
  CredentialCardProps & HTMLProps<HTMLDivElement>
> = ({
  title,
  data,
  style,
  className,
  image,
  createdByAddress,
  schema,
  ...rest
}) => {
  const baseUnit = (4 / 334) * 100 * 4 + "cqw";

  function toReadable(val: string) {
    return startCase(camelCase(val));
  }

  const calloutKey = schemas.find((s) => s.name === schema)?.calloutField;
  const calloutVal = (calloutKey && data[calloutKey]) || "";
  const meta = calloutVal && `${toReadable(calloutVal)}`;

  const [address, setAddress] = useState<string | undefined>();

  useEffect(() => {
    setAddress(truncateAddress(createdByAddress as Address) || undefined);
  }, [createdByAddress]);

  return (
    <div
      className={`flex flex-grow flex-wrap ${className}`}
      style={
        {
          containerType: "inline-size",
          "--base-unit": baseUnit,
        } as React.CSSProperties
      }
    >
      <div
        className="flex-grow aspect-video relative"
        style={{ width: 320, containerType: "inline-size" }}
      >
        <div
          className=" bg-cover w-full h-full bg-pink-50 flex flex-col"
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
          <p style={{ fontSize: "1.2em" }}>{meta}</p>
          {address && (
            <>
              <h2
                className="uppercase tracking-wider mt-auto"
                style={{ fontSize: "0.8em" }}
              >
                From
              </h2>
              <p style={{ fontSize: "1.2em" }}>{address}a</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

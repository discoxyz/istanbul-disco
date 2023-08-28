import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FC } from "react";
import { Button, ButtonLink } from "./button";
import { useAccount } from "wagmi";

const Loading: FC = () => (
  <>
    <h1 className="text-xl">Loading</h1>
  </>
);

const NotConnected: FC = () => (
  <>
    <h1 className="mb-2 text-2xl">Not Connected</h1>
    <ConnectButton />
  </>
);

const UnClaimed: FC<{
  claim: () => void;
  error?: boolean;
  claiming?: boolean;
}> = ({ claim }) => (
  <>
    <h1 className="mb-2 text-2xl">Drop not claimed</h1>
    <p className="mb-4 text-xl text-white/60">Claim your credential now!</p>
    <Button onClick={claim}>Claim</Button>
  </>
);

const Claimed: FC<{
  name: string;
  path: string;
}> = ({ name, path }) => (
  <>
    <h1 className="mb-2 text-2xl">Drop claimed!</h1>
    <p className=" mb-3 text-xl text-white/60">Spread the good news:</p>
    <ButtonLink
      customColorClasses="bg-[#1DA1F2]"
      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `I just claimed my ${name} credential at Disco 🪩
${process.env.NEXT_PUBLIC_VERCEL_URL}/${path}`,
      )}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      Tweet now
    </ButtonLink>
  </>
);

const NotEligible: FC = () => (
  <>
    <h1 className="mb-2 text-2xl">Oh no!</h1>
    <p className="text-xl text-white/60">
      You aren&apos;t eligible for this drop. Try connecting with a different
      address.
    </p>
  </>
);

export const ClaimArea: FC<{
  claimed: boolean;
  claiming: boolean;
  loading: boolean;
  eligible: boolean;
  drop: {
    name: string;
    path: string;
  };
  claim?: () => void;
  className?: string;
}> = ({
  claimed,
  claiming,
  loading,
  eligible,
  drop,
  claim = () => null,
  className,
}) => {
  const { isConnected } = useAccount();
  return (
    <div className={`${className}`}>
      {!isConnected ? (
        <NotConnected />
      ) : loading ? (
        <Loading />
      ) : claimed ? (
        <Claimed {...drop} />
      ) : !eligible ? (
        <NotEligible />
      ) : (
        <UnClaimed claiming={claiming} claim={claim} />
      )}
    </div>
  );
};

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FC, PropsWithChildren } from "react";
import { Button } from "./button";
import { useAccount } from "wagmi";

const Loading: FC = () => (
  <>
    <h1 className="text-xl">Loading</h1>
    <ConnectButton />
  </>
);

const NotConnected: FC = () => (
  <>
    <h1 className="text-xl">Not Connected</h1>
    <ConnectButton />
  </>
);

const UnClaimed: FC<{
  claim: () => void;
  error?: boolean;
  claiming?: boolean;
}> = ({ claim }) => (
  <>
    <h1 className="text-2xl">Drop not claimed</h1>
    <Button onClick={claim}>Claim</Button>
  </>
);

const Claimed: FC = () => (
  <>
    <h1 className="text-xl">Drop claimed!</h1>
    <p className="text-xl text-white/60">Spread the good news:</p>
    <Button customColorClasses="bg-[#1DA1F2]">Tweet now</Button>
  </>
);

const NotEligible: FC = () => (
  <>
    <h1>You are not eligible for this drop</h1>
    <p>Try again with a different address</p>
  </>
);

export const ClaimArea: FC<{
  claimed: boolean;
  claiming: boolean;
  loading: boolean;
  eligible: boolean;
  claim?: () => void;
  className?: string;
}> = ({
  claimed,
  claiming,
  loading,
  eligible,
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
        <Claimed />
      ) : !eligible ? (
        <NotEligible />
      ) : (
        <UnClaimed claiming={claiming} claim={claim} />
      )}
    </div>
  );
};

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "./button";
import { Card } from "./card";
import { FC } from "react";
import { useDid3Context } from "../contexts/did3Context";
import { styled } from "@stitches/react";
import { useAccount } from "wagmi";
import { useDataContext } from "../contexts/claimProvider";
const StyledCard = styled(Card, {
  maxWidth: 450,
  margin: "24px auto",
});
const StyledCred = styled("div", {
  padding: 16,
  borderRadius: 16,
  color: "#FFF",
  background: `url(/bg_disco.png)`,
  backgroundSize: "cover",
  aspectRatio: 1.8,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
});

const Title = styled("h1", {
  fontFamily: "syne",
  fontWeight: 800,
  fontSize: 24,
  opacity: 0.8,
  textTransform: "uppercase",
});

const InfoTitle = styled("h2", {
  fontFamily: "syne",
  fontWeight: 800,
  fontSize: 24,
  opacity: 0.8,
  textTransform: "uppercase",
  variants: {
    type: {
      ineligible: {
        color: "#bb5353",
      },
    },
  },
});

const truncateDid = (did: string) => did.slice(0, 6) + "..." + did.slice(-4);

export const EligibilityBox: FC<{
  state: "loading" | "eligible" | "ineligible" | "claimed";
  loading?: boolean;
  action?: () => void;
}> = ({ state, loading = false, action }) => {
  const { openConnectModal } = useConnectModal();
  const { did } = useDataContext();
  const { isDisconnected } = useAccount();
  const { isCeramicConnected, connectCeramic, isCeramicConnecting } =
    useDid3Context();

  if (isDisconnected) {
    return (
      <Card transparent>
        <h3>Connect your wallet</h3>
        <Button fullWidth onClick={openConnectModal}>
          Connect Wallet
        </Button>
      </Card>
    );
  }

  if (!isCeramicConnected) {
    <Card transparent>
      <h3>Connect to ceramic to create your DID</h3>
      <p>Ceramic generates a DID:3: identifier for you</p>
      <Button fullWidth onClick={connectCeramic}>
        {isCeramicConnecting ? "Connecting..." : "Connect"}
      </Button>
    </Card>;
  }

  if (state == "loading") {
    return (
      <Card transparent>
        <h3>Loading</h3>
      </Card>
    );
  }

  if (state == "ineligible") {
    return (
      <StyledCard transparent>
        <InfoTitle type="ineligible">Not eligible!</InfoTitle>
        <p>Unfortunately you are not eligible for this credential</p>
        <Button fullWidth as="a" href={"https://app.disco.xyz"}>
          View at Disco
        </Button>
      </StyledCard>
    );
  }

  if (state == "claimed") {
    return (
      <StyledCard transparent>
        <h3>You have claimed your credential!</h3>
        <p>Successfully issued to {truncateDid(did as string)}</p>
        <Button fullWidth as="a" href={"https://app.disco.xyz"}>
          View at Disco
        </Button>
      </StyledCard>
    );
  }

  if (state == "eligible") {
    <Card transparent>
      <h3>Claim your Credential now</h3>
      <p>Claim your credential with your address:</p>
      <pre>{did}</pre>
      <Button fullWidth onClick={action && action}>
        {loading ? "Claiming..." : "Claim Credntial"}
      </Button>
    </Card>;
  }
};

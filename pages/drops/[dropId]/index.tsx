import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { useAccount, useDisconnect } from "wagmi";
import { Key, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "../../../components/button";
import { Card } from "../../../components/card";
import { styled } from "@stitches/react";
import { StyledMeta } from "../../../components/styledMeta";
import { startCase, camelCase } from "lodash";
import { Container } from "../../../components/container";
import { Prisma } from "@prisma/client";
import { useDid3Context } from "../../../contexts/did3Context";
import { useDataContext } from "../../../contexts/claimProvider";
import { EligibilityBox } from "../../../components/eligibilityBox";
import { VC } from "../../../components/VC";

const StyledCard = styled(Card, {
  maxWidth: 450,
  margin: "24px auto",
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

const Drop: NextPage = () => {
  const {
    query: { dropId },
  } = useRouter();
  const { did, address, isLoading: accountLoading } = useDataContext();
  const { isDisconnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { did3, isCeramicConnected, isCeramicConnecting, connectCeramic } =
    useDid3Context();

  const [drop, setDrop] = useState<
    { isLoading?: boolean } & Partial<Prisma.DropGetPayload<{}>>
  >({ isLoading: true });
  const [claimData2, setClaimData] = useState<any>({
    isLoading: true,
    address: undefined,
    eligible: false,
  });
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const getDrop = useCallback(async () => {
    setDrop({ isLoading: true });
    const res = await fetch(`/api/drops/getDropByPath/${dropId}`);
    const parsed = await res.json();
    setDrop({ ...parsed.data, isLoading: false });
  }, [dropId, setDrop]);

  useEffect(() => {
    if (!accountLoading && (address || did || !isClaiming)) {
      const getIsGated = async () => {
        const res = await fetch("/api/drops/getDropEligibility", {
          method: "POST",
          body: JSON.stringify({
            id: drop.id,
            address: address,
            did3: did,
          }),
        });
        const json = await res.json();
        if (
          json.data &&
          (json.data.address === address || json.data.address === did)
        ) {
          setClaimData({
            ...json.data,
            eligible: true,
            isLoading: false,
          });
        } else {
          setClaimData({
            claimed: false,
            eligible: !drop.gated,
            isLoading: false,
          });
        }
      };
      getIsGated();
    }
  }, [drop, address, did, accountLoading, isClaiming]);

  useEffect(() => {
    if (!accountLoading && (address || did)) {
      const getIsGated = async () => {
        const res = await fetch("/api/drops/getDropEligibility", {
          method: "POST",
          body: JSON.stringify({
            id: drop.id,
            address: address,
            did3: did,
          }),
        });
        const json = await res.json();
        console.log(json, address)
        if (
          json.data &&
          (json.data.address === address || json.data.address === did)
        ) {
          return {
            ...json.data,
            eligible: true,
            isLoading: false,
          };
        } else {
          return {
            claimed: false,
            eligible: !drop.gated,
            isLoading: false,
          };
        }
      }
      console.log('FN TRIGGERED')
      const res = getIsGated();
      setClaimData(res);
    }
  }, [drop, address, did, accountLoading]);

  const issue = useCallback(async () => {
    if (claimData2.eligible && drop && did && !isClaiming) {
      setIsClaiming(true);
      await fetch("/api/drops/claimDrop", {
        method: "POST",
        body: JSON.stringify({
          claimId: claimData2?.id,
          dropId: drop.id,
          did3: did,
        }),
      });
      setIsClaiming(false);
    }
  }, [isClaiming, claimData2, drop, did, setIsClaiming]);

  useEffect(() => {
    dropId && getDrop();
  }, [dropId]);

  const Section = () => {
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
    if (!drop || accountLoading || claimData2.isLoading || drop.isLoading) {
      return "loading...";
    }
    if (!did) {
      return (
        <Card transparent>
          <h3>Connect to ceramic to create your DID</h3>
          <p>Ceramic generates a DID:3: identifier for you</p>
          <Button fullWidth onClick={connectCeramic}>
            {isCeramicConnecting ? "Connecting..." : "Connect"}
          </Button>
        </Card>
      );
    }
    if (!claimData2.isLoading && claimData2.claimed) {
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

    if (!claimData2.isLoading && !claimData2.eligible && !claimData2.address) {
      return (
        <StyledCard transparent>
          <InfoTitle type="ineligible">Not eligible!</InfoTitle>
          <p>Unfortunately you are not eligible for this credential</p>
        </StyledCard>
      );
    }

    if (
      !claimData2.isLoading &&
      claimData2.eligible &&
      (claimData2.address === address || claimData2.address === did)
    ) {
      return (
        <Card transparent>
          <h3>Claim your Credential now</h3>
          <p>Claim your credential with your address:</p>
          <pre>{did}</pre>
          <Button fullWidth onClick={issue}>
            {isClaiming ? "Claiming..." : "Claim Credntial"}
          </Button>
        </Card>
      );
    }

    /// Fallback if DID wasn't auto posted on connect
    return null;
  };

  return (
    <>
      <Container>
        <StyledCard as={"header"}>
          <Card transparent>
            <Title>{drop.name}</Title>
            <VC drop={drop} />
            <Section />
          </Card>
        </StyledCard>
      </Container>
    </>
  );
};

export default Drop;

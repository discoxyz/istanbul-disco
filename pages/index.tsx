import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { useAccount, useDisconnect } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { useDid3Context } from "../contexts/did3Context";
import { apiIssueCred } from "../apiFn/apiIssueCred";
import { apiGetAddressStatus } from "../apiFn/apiGetAddressStatus";
import { apiClaimDid } from "../apiFn/apiClaimDid";
import { apiClearStatus } from "../apiFn/apiClearStatus";
import { Button } from "../components/button";
import { Card } from "../components/card";
import { styled } from "@stitches/react";
import { StyledMeta } from "../components/styledMeta";

const StyledCard = styled(Card, {
  maxWidth: 450,
});

const StyledContainer = styled("div", {
  padding: 16,
  display: "flex",
  justifyContent: "center",
  marginBottom: 24,
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

const truncateDid = (did: string) => did.slice(0, 6) + "..." + did.slice(-4);

const Home: NextPage = () => {
  const { disconnect } = useDisconnect();
  const { isConnected, isDisconnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [proxyIsConnected, setProxyIsConnected] = useState(false);
  const {
    isCeramicConnected,
    isCeramicConnecting,
    did3,
    connectCeramic,
    disconnectCeramic,
  } = useDid3Context();
  const [isMounted, setIsMounted] = useState(false);
  const [did, setDid] = useState<string | "loading" | null>();
  const [loading, setLoading] =useState(false)
  const [status, setStatus] = useState<{
    did?: string;
    claimed?: boolean;
    error?: boolean;
    message?: string;
  }>({});
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* Manage connect fn */
  const connect = useCallback(() => {
    if (isCeramicConnected) {
      disconnectCeramic();
    } else {
      connectCeramic();
    }
  }, [connectCeramic, disconnectCeramic, isCeramicConnected]);

  ////////
  // ISSUE HANDLER
  ////////
  const issue = useCallback(async () => {
    if (status.did && address) {
      setLoading(true)
      try {
        const res = await apiIssueCred(status.did, address);
        setLoading(false)
        console.log(res)
        setStatus({
          did: status.did,
          claimed: res.success,
          message: res.message,
          error: !res.success,
        });
      } catch (err) {
        console.log('ERROR CAUGHT')
        setLoading(false)
        setStatus({
          did: status.did,
          claimed: false,
          message:
            "Something went wrong when claiming your credential, please try again later",
          error: true,
        });
      }
    }
  }, [status.did, address, setStatus]);

  ////////
  // AUTO FETCH STATUS UPON WALLET CONNECTION
  ////////
  useEffect(() => {
    if (address && !fetched) {
      const handle = async () => {
        setLoading(true)
        const res = await apiGetAddressStatus(address);
        setLoading(false)
        setStatus({
          did: res.info?.did,
          claimed: res.info?.claimed,
          message: res.message,
          error: !res.success,
        });
        setFetched(true);
      };
      handle();
    }
  }, [address, setStatus, fetched]);

  ////////
  // AUTO SET STATUS UPON DID3 CONNECTION
  ////////
  useEffect(() => {
    if (address && did3 && !did && fetched) {
      const handle = async () => {
        setLoading(true)
        const res = await apiClaimDid(did3, address);
        setLoading(false)
        setStatus({
          did: res.info?.did,
          message: res.message,
          error: !res.success,
        });
      };
      handle();
    }
  }, [address, did3, did, setStatus, fetched]);

  const Section = () => {
    if (isDisconnected) {
      return (
        <Card transparent >
          <h3>Connect your wallet</h3>
          <Button fullWidth onClick={openConnectModal}>
            Connect Wallet
          </Button>
        </Card>
      );
    }
    if (!fetched) {
      return "loading...";
    }
    if (status.claimed && status.did) {
      return (
        <StyledCard transparent>
          <h3>You have claimed your credential!</h3>
          <p>Successfully issued to {truncateDid(status.did as string)}</p>
          <Button fullWidth as="a" href={"https://app.disco.xyz"}>
            View at Disco
          </Button>
        </StyledCard>
      );
    }
    if (status.did) {
      return (
        <Card transparent>
          <h3>Claim your Credential now</h3>
          <p>Claim your credential with your address:</p>
          <pre>{did}</pre>
          <Button fullWidth onClick={issue}>
            {loading ? "Claiming..." : "Claim Credential"}
          </Button>
        </Card>
      );
    }
    if (!did && !did3 && fetched) {
      return (
        <Card transparent>
          <h3>Connect to ceramic to create your DID</h3>
          <p>Ceramic generates a DID:3: identifier for you</p>
          <Button fullWidth onClick={connect}>
            {isCeramicConnecting ? "Connecting..." : "Connect"}
          </Button>
        </Card>
      );
    }

    /// Fallback if DID wasn't auto posted on connect
    return null;
  };

  useEffect(() => {
    setProxyIsConnected(isConnected);
  }, [isConnected]);

  const clear = useCallback(async () => {
    if (address) apiClearStatus(address);
  }, [address]);

  return (
    <>
      <StyledContainer>
        <StyledCard as={"header"}>
          <Card transparent>
            <h1>Claim attendance credential</h1>
            <StyledCred>
              <h2>Attendance</h2>
              <div>
                <StyledMeta title="Event Name" content="Eiffel in Crypto" />
                {/* <StyledMeta title="Description" content="Hello world" /> */}
                <StyledMeta title="Date" content="18 July 2023" />
                <StyledMeta title="Format" content="VC @ Disco" />
              </div>
            </StyledCred>
          </Card>
          {isMounted && <Section />}
        </StyledCard>
      </StyledContainer>
      {proxyIsConnected && (
        <Button text blockCenter onClick={() => disconnect()}>
          Disconnect Wallet
        </Button>
      )}

      {/* <Button onClick={clear}>Clear</Button> */}
    </>
  );
};

export default Home;

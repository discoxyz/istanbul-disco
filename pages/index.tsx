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
  return (
    <>
      <StyledContainer>
        <StyledCard as={"header"}>
          <Card transparent>
            <h1>Disco Drops</h1>
          </Card>
        </StyledCard>
      </StyledContainer>
    </>
  );
};

export default Home;

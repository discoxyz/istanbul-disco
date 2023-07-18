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
import Link from "next/link";

const StyledCard = styled(Card, {
  maxWidth: 450,
  margin: "24px auto",
  flex: 1,
  marginRight: 32,
  marginLeft: 0,
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

const Flex = styled("div", {
  display: "flex",
  maxWidth: 900,
  margin: "32px auto",
});

const truncateDid = (did: string) => did.slice(0, 6) + "..." + did.slice(-4);

const ManageDrop: NextPage = () => {
  const {
    query: { dropId },
  } = useRouter();
  const [claims, setClaims] = useState<
    { claimed?: boolean; address: string }[]
  >([]);

  const [drop, setDrop] = useState<
    { isLoading?: boolean } & Partial<Prisma.DropGetPayload<{}>>
  >({ isLoading: true });

  useEffect(() => {
    const fetchClaims = async () => {
      const res = await fetch("/api/drops/getClaims", {
        method: "POST",
        body: JSON.stringify({
          dropId: drop.id,
        }),
      });
      const json = await res.json();
      setClaims(json.data);
    };
    if (drop.id) fetchClaims();
  }, [drop?.id]);

  const getDrop = useCallback(async () => {
    setDrop({ isLoading: true });
    const res = await fetch(`/api/drops/getDropByPath/${dropId}`);
    const parsed = await res.json();
    setDrop({ ...parsed.data, isLoading: false });
  }, [dropId, setDrop]);

  useEffect(() => {
    dropId && getDrop();
  }, [dropId]);

  return (
    <>
      <Flex>
        <StyledCard as={"header"}>
          <Card transparent>
            <Title>{drop.name}</Title>
            <VC drop={drop} />
          </Card>
          <Button
            as={Link}
            href={`/drops/${dropId}/update`}
            style={{
              display: "inline-block",
              marginTop: 12,
              marginBottom: 24,
              marginLeft: 12,
            }}
          >
            Update
          </Button>
          <Button
            as={Link}
            href={"update"}
            style={{
              display: "inline-block",
              marginTop: 12,
              marginBottom: 24,
              marginLeft: 12,
            }}
          >
            Pause
          </Button>
          <Button
            as={Link}
            href={"update"}
            style={{
              display: "inline-block",
              marginTop: 12,
              marginBottom: 24,
              marginLeft: 12,
            }}
          >
            Hide
          </Button>
        </StyledCard>
        <div>
          <h2>Claims</h2>
          {claims?.map(({ claimed, address }, key) => (
            <div key={key}>
              {truncateDid(address)}
              {claimed && " • claimed"}
            </div>
          ))}
        </div>
      </Flex>
    </>
  );
};

export default ManageDrop;

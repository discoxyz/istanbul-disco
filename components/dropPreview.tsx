import { Prisma } from "@prisma/client";
import { styled } from "@stitches/react";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useDid3Context } from "../contexts/did3Context";
import { useDataContext } from "../contexts/claimProvider";
import { VC } from "./VC";
import { Chip } from "./chip";

const Row = styled("div", {
  display: "flex",
  alignSelf: "flex-start",
  alignItems: "flex-start",
  marginBottom: 16,
  background: "rgba(255,255,255,0.05)",
  borderRadius: 16,
  padding: 16,
  transition: "600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  "&:hover": {
    transform: "scale(1.01)",
  },
});

const Title = styled("h2", {
  fontFamily: "syne",
  fontWeight: 800,
  fontSize: 24,
  opacity: 0.8,
  textTransform: "uppercase",
  margin: 0,
  marginBottom: 8,
});

const Description = styled("p", {
  fontSize: 20,
  opacity: 0.6,
  margin: 0,
  marginBottom: 12,
});

const Left = styled(VC, {
  width: "45%",
});

const Right = styled("div", {
  flex: 1,
  marginLeft: 24,
  marginTop: 8,
});

export const DropPreview: FC<{ drop: Prisma.DropGetPayload<{}> }> = ({
  drop,
  ...rest
}) => {
  // const { address } = useAccount();
  const { did, address, isLoading: accountLoading } = useDataContext();
  const [data, setData] = useState<any>();
  const [status, setStatus] = useState<any>({ isLoading: true });
  console.log(drop);

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
        if (
          json.data &&
          (json.data.address === address || json.data.address === did)
        ) {
          setStatus({
            claimed: json.data.claimed,
            eligible: true,
            isLoading: false,
          });
          setData(data);
        } else {
          setStatus({
            claimed: false,
            eligible: !drop.gated,
            isLoading: false,
          });
        }
      };
      getIsGated();
    }
  }, [address, did, accountLoading]);

  return (
    <Row as={Link} href={`/drops/${drop.path}`}>
      <Left drop={drop} />
      <Right>
        <Title>{drop.name}</Title>
        <Description>{drop.description || "ayoooo"}</Description>
        {!status.isLoading && (
          <Chip
            type={
              status.claimed
                ? "claimed"
                : status.eligible
                ? "eligible"
                : "error"
            }
          >
            {status.claimed
              ? "Claimed"
              : status.eligible
              ? "Eligible"
              : "Ineligible"}
          </Chip>
        )}
      </Right>
    </Row>
  );
};

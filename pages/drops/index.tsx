import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { useAccount, useDisconnect } from "wagmi";
import { Key, useCallback, useEffect, useState } from "react";
import { styled } from "@stitches/react";
import Link from "next/link";
import { Button } from "../../components/button";
import { Container } from "../../components/container";
import { Prisma } from "@prisma/client";
import { DropPreview } from "../../components/dropPreview";

const Grid = styled("div", {
  display: "grid",
});

const TitleRow = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 24,
  marginLeft: 24,
});

const Drops: NextPage = () => {
  const [isMounted, setIsMounted] = useState(false);

  const [drops, setDrops] = useState<Prisma.DropGetPayload<{}>[]>();

  useEffect(() => {
    const getDrops = async () => {
      const res = await fetch("/api/drops/getDrops");
      const parsed: { data: any; message: string } = await res.json();
      setDrops(parsed.data);
    };
    getDrops();
  }, []);

  useEffect(() => {
    console.log(drops);
  }, [drops]);

  return (
    <Container>
      <TitleRow as="header">
        <h1>Drops</h1>
        <Button as={Link} href={"/drops/create"}>
          Create
        </Button>
      </TitleRow>
      {drops?.map((drop: Prisma.DropGetPayload<{}>, i: Key) => (
        <DropPreview
          drop={{ ...drop, subjectData: JSON.parse(drop.subjectData || "{}") }}
          key={i}
        />
      ))}
    </Container>
  );
};

export default Drops;

import { styled } from "@stitches/react";
import { useDid3Context } from "../contexts/did3Context";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "./button";
import Link from "next/link";

const StyledNav = styled("nav", {
  width: "100%",
  padding: "12px 24px",
  position: "sticky",
  borderBottom: '1px solid rgba(0,0,0,0.3)',
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor:  'rgba(0,0,0,0.4)'
});

const Logo = styled("h1", {
  margin: 0,
  fontFamily: "syne",
  fontWeight: 800,
  fontSize: 32,
  opacity: 0.8,
});

export const Nav = () => {
  const { connectCeramic, did3 } = useDid3Context();
  return (
    <StyledNav>
      <Logo as={Link} href='/drops'>DROPS</Logo>
      <ConnectButton />
    </StyledNav>
  );
};

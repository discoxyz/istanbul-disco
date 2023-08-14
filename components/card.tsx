import { styled } from "@stitches/react";

export const Card = styled("div", {
  padding: 12,
  borderRadius: 16,
  backgroundColor: "rgba(0,0,0,0.4)",
  variants: {
    transparent: {
      true: {
        background: 'transparent'
      }
    }
  }
});

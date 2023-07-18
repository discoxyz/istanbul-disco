import { styled } from "@stitches/react";

export const Chip = styled("div", {
  fontSize: 14,
  padding: "3px 8px",
  backgroundColor: "rgba(255,255,255,0.2)",
  borderRadius: 4,
  border: "1px solid rgba(0,0,0,0.2)",
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  display: "block",
  width: 'fit-content',
  variants: {
    type: {
      error: {
        backgroundColor: "rgba(164, 18, 18, 0.8)",
      },
      eligible: {
        backgroundColor: "rgba(10, 166, 98, 0.8)",
      },
      claimed: {
        backgroundColor: "rgba(10, 88, 166, 0.8)",
      },
    },
  },
});

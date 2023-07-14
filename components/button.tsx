import { styled } from "@stitches/react";

export const Button = styled("button", {
  // Reset
  appearance: "none",
  outline: "none",
  boxShadow: "none",
  border: "none",
  // Styles
  cursor: "pointer",
  borderRadius: 8,
  background: "#3c139a",
  color: "#FFF",
  padding: "16px 16px",
  fontSize: "16px",
  transition: "600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  display: "block",
  textAlign: "center",
  "&:hover": {
    transparency: 0.95,
    transform: "scale(1.03)",
  },
  "&:active": {
    transparency: 0.95,
    transform: "scale(0.97)",
  },
  variants: {
    fullWidth: {
      true: {
        width: "100%",
      },
    },
    text: {
      true: {
        background: "transparent",
        opacity: 0.6,
        color: "#fff)",
      },
    },
    blockCenter: {
      true: {
        marginLeft: "auto",
        marginRight: "auto",
      },
    },
  },
});

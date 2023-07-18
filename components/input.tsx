import { FC } from "react";
import { ComponentProps, styled } from "@stitches/react";
import { base } from "@rainbow-me/rainbowkit/dist/css/reset.css";

const baseStyle = {
  fontSize: 16,
  padding: 16,
  borderRadius: 8,
  marginBottom: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  display: "block",
  width: "100%",
  color: "#FFF",
  appearance: "none",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    outline: "none",
    border: "1px solid rgba(255,255,255, 0.5",
  },
  "&:focus": {
    outline: "none",
    border: "1px solid rgba(255,255,255, 0.5",
    appearance: "none",
  },
};

const StyledInput = styled("input", {
  ...baseStyle,
});

type StyledInputType = ComponentProps<typeof StyledInput>;

const StyledTextArea = styled("textarea", {
  ...baseStyle,
  height: `calc( 3em + ( padding * 2 ) )`
});

const StyledLabel = styled("label", {
  display: "block",
  marginBottom: 8,
});

const StyledHelper = styled("label", {
  marginTop: 4,
  opacity: 0.6,
  fontSize: 14,
});

const StyledContainer = styled("div", {
  display: "block",
  width: "100%",
  marginBottom: 32,
});

type StyledTextAreaType = ComponentProps<typeof StyledTextArea>;

export const Input: FC<
  StyledInputType & { label: string; description?: string }
> = ({ label, description, ...rest }) => (
  <StyledContainer>
    <StyledLabel>{label}</StyledLabel>
    <StyledInput {...rest} />
    <StyledHelper>{description}</StyledHelper>
  </StyledContainer>
);

export const TextArea: FC<
  StyledTextAreaType & { label: string; description?: string }
> = ({ label, description, ...rest }) => (
  <StyledContainer>
    <StyledLabel>{label}</StyledLabel>
    <StyledTextArea {...rest} />
    <StyledHelper>{description}</StyledHelper>
  </StyledContainer>
);

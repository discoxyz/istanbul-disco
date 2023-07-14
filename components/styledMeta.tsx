import { styled } from "@stitches/react";
import { FC } from "react";

const StyledMetaRow = styled("div", {
  fontFamily: "monospace",
  display: "flex",
  flexWrap: "wrap",
});

const StyledItem = styled("div", {
  flex: 1,
  opacity: 0.8,
  "&.bold": {
    fontWeight: 500,
  },
});

export const StyledMeta: FC<{ title: string; content: string }> = ({
  title,
  content,
}) => (
  <StyledMetaRow>
    <StyledItem className="bold">{title}</StyledItem>
    <StyledItem>{content}</StyledItem>
  </StyledMetaRow>
);

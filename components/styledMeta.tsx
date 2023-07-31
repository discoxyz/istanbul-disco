import { styled } from "@stitches/react";
import { FC } from "react";
import { startCase, camelCase } from "lodash";

const StyledMetaRow = styled("div", {
  fontFamily: "monospace",
  display: "flex",
  flexWrap: "wrap",
});

const StyledItem = styled("div", {
  flex: 1,
  opacity: 0.8,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  "&.bold": {
    fontWeight: 500,
  },
});

export const StyledMeta: FC<{ title: string; content: string }> = ({
  title,
  content,
}) => (
  <StyledMetaRow>
    <StyledItem className="bold">{startCase(camelCase(title))} </StyledItem>
    <StyledItem>{content}</StyledItem>
  </StyledMetaRow>
);

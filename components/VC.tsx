import { FC } from "react";
import { StyledMeta } from "./styledMeta";
import { camelCase, startCase } from "lodash";
import { styled } from "@stitches/react";

const StyledCred = styled("div", {
  padding: 16,
  borderRadius: 16,
  color: "#FFF",
  backgroundSize: "cover",
  aspectRatio: 1.8,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
});

export const VC: FC<{ drop: any }> = ({ drop, ...rest }) => {
  let parsed = {}
  try {
    parsed = JSON.parse(drop.subjectData);
  } catch (e) {}
  return (
    <StyledCred
      {...rest}
      style={{ backgroundImage: `url(${drop.image || "/bg_disco.png"})` }}
    >
      <h2>Disco.xyz</h2>
      <div>
        {Object.entries(parsed).map(([key, value]) => {
          if (typeof value === "string") {
            return (
              <StyledMeta
                key={key}
                title={key}
                content={startCase(camelCase(value))}
              />
            );
          }
        })}
        <StyledMeta title="Format" content="VC @ Disco" />
      </div>
    </StyledCred>
  );
};

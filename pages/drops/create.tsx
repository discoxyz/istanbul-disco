import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { useAccount, useDisconnect } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { styled } from "@stitches/react";
import Link from "next/link";
import { Button } from "../../components/button";
import { Input, TextArea } from "../../components/input";
import { Container } from "../../components/container";

const Left = styled("div", {
  flex: 1,
  paddingRight: 16,
});
const Right = styled(VC, {
  position: "sticky",
  top: 32,
  width: 320,
});
const Flex = styled(`div`, {
  display: "flex",
  alignItems: "start",
});

import { Prisma } from "@prisma/client";
import { VC } from "../../components/VC";
const CreateDrop: NextPage = () => {
  const [data, setData] = useState<
    Partial<Prisma.DropCreateInput> & { visible: boolean; eligible?: string }
  >({
    visible: true,
  });
  const [published, hasPublished] = useState(false);

  const handleUpdate = useCallback(
    (event: any) => {
      let val = event.target.value;
      if (event.target.type === "number") {
        val = parseInt(event.target.value);
      }
      console.log(data);
      setData({
        ...data,
        [`${event.target.name}`]: val,
      });
    },
    [data]
  );

  const handleCheck = useCallback(
    (event: any) => {
      setData({
        ...data,
        [`${event.target.name}`]: event.target.checked,
      });
    },
    [data]
  );

  const publish = useCallback(async () => {
    await fetch("/api/drops/addDrop", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }, [data]);

  const fields: {
    label: string;
    required?: boolean;
    description?: string;
    textarea?: boolean;
    placeholder?: string;
    name: keyof typeof data;
    type?: "textarea" | "number" | "boolean" | "text";
  }[] = [
    {
      label: "Drop Name",
      name: "name",
      required: true,
    },
    {
      label: "Drop Description",
      name: "description",
      textarea: true,
      required: true,
      description: "A brief description of your drop",
    },
    {
      label: "Drop Image",
      name: "image",
      description: "A url to a hosted image to use for the drop",
    },
    {
      label: "URL",
      name: "path",
      required: true,
      placeholder: "my drop",
      description: "e.g. claim.disco.xyz/hello",
    },
    {
      label: "Schema",
      name: "schema",
      required: true,
      textarea: true,
      placeholder: "my drop",
      description: "e.g. claim.disco.xyz/hello",
    },
    {
      label: "Subject",
      name: "subjectData",
      textarea: true,
      placeholder: "my drop",
      description: "The fixed content for the credential",
    },
    {
      label: "Start time",
      name: "startTime",
    },
    {
      label: "End time",
      name: "endTime",
    },
    {
      label: "Limit",
      name: "limit",
      type: "number",
      description: "Optional limit",
    },
    {
      name: "visible",
      type: "textarea",
      label: "Can be claimed",
      description: "Optional comma-separated list of addresses and/or DIDs",
    },
  ];

  return (
    <Container>
      <h1>Create a drop</h1>
      <Flex>
        <Left>
          {fields.map((field, key) => {
            if (
              !field.type ||
              field.type === "text" ||
              field.type === "number"
            ) {
              return (
                <Input
                  key={key}
                  label={field.label}
                  type={field.type || "text"}
                  name={field.name}
                  required={field.required}
                  value={data[field.name]?.toString() || ""}
                  onChange={handleUpdate}
                  description={field.description}
                />
              );
            } else if (field.type === "textarea") {
              <TextArea
              key={key}
                label={field.label}
                name={field.name}
                required={field.required}
                value={data[field.name]?.toString() || ""}
                onChange={handleUpdate}
                description={field.description}
              />;
            }
            return (
              <div key={key}>
                <label>{field.label}</label>
                <input
                  name={field.name}
                  checked={(data[field.name] as boolean) || false}
                  type="checkbox"
                  onChange={handleCheck}
                />
              </div>
            );
          })}
          <div>
            <label>Gate credential?</label>
            <input
              name={"gated"}
              checked={(data["gated"] as boolean) || false}
              type="checkbox"
              onChange={handleCheck}
            />
          </div>
          <TextArea
            onChange={handleUpdate}
            value={data.eligible || ""}
            {...{
              label: "Recipients",
              name: "eligible",
              placeholder: "Eligible",
              description:
                "A list of dids or addresses that my claim the credential",
            }}
          />
          <Button onClick={publish}>Publish</Button>
        </Left>
        <Right drop={data} />
      </Flex>
    </Container>
  );
};

export default CreateDrop;

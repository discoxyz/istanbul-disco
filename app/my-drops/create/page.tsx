"use client";

import Head from "next/head";
import { Nav } from "../../../components/v2/nav";
import { PrismaClient } from "@prisma/client";
import { FC, PropsWithChildren, useCallback, useState } from "react";
import { Credential } from "../../../components/v2/credCard";
import { useAccount, useSignMessage } from "wagmi";
import Link from "next/link";
import { DropForm } from "../../../components/v2/dropForm";
// import { recoverMessageAddress } from "viem";

// const prisma = new PrismaClient();

export default function Page() {
  const { data, error, isLoading, signMessageAsync, variables } =
    useSignMessage();
  const { address, isConnected } = useAccount();
  const fields: {
    [key: string]: {
      enabledBy?: string;
      superficial?: boolean;
      toggle?: {
        label: string;
        type: "checkbox";
        value: boolean;
      };
      field: {
        required?: boolean;
        label: string;
        type: "text" | "checkbox" | "number" | "datetime-local" | "textarea";
        placeholder?: string | number;
        pattern?: string;
        validateAs?:
          | "string"
          | "url"
          | "json"
          | "number"
          | "path"
          | "address-csv";
        value: string | number | boolean;
        helper?: string;
        error?: boolean;
        errorMessage?: string;
      };
    };
  } = {
    name: {
      field: {
        required: true,
        label: "Name",
        type: "text",
        value: "",
        validateAs: "string",
        errorMessage: "Drop name is required",
      },
    },
    description: {
      field: {
        required: true,
        label: "Description",
        placeholder: "Add a descriiption of your drop",
        type: "text",
        validateAs: "string",
        value: "",
        errorMessage: "Drop description is required",
      },
    },
    image: {
      field: {
        required: false,
        label: "Image",
        placeholder: "Add a link to your image",
        type: "text",
        validateAs: "url",
        value: "",
        errorMessage: "Drop description is required",
      },
    },
    path: {
      field: {
        required: true,
        label: "Path",
        placeholder: "A path to your drop",
        // Disable spaces regex
        validateAs: "path",
        pattern: "^S+$",
        helper: "https://claim.disco.xyz/{value}",
        type: "text",
        value: "",
        errorMessage: "Drop path is required",
      },
    },
    schema: {
      field: {
        required: true,
        label: "Path to your schema",
        placeholder: "https://raw.githubusercontent.com/.....",
        // Html regex
        pattern: "^(http(s)?://)+[w-._~:/?#[]@!$&'()*+,;=.]+$",
        validateAs: "url",
        type: "text",
        value: "",
        errorMessage: "Valid schema URL is required",
      },
    },
    subjectData: {
      field: {
        required: true,
        label: "The subjectdata of your schema",
        placeholder: '{"foo": "bar"}',
        validateAs: "json",
        type: "textarea",
        value: "",
        errorMessage: "SubjectData as JSON is required",
      },
    },
    limit: {
      toggle: {
        label: "Turn on claim limit",
        type: "checkbox",
        value: false,
      },
      field: {
        label: "The amount of addresses which may claim the credential",
        placeholder: "0",
        type: "number",
        validateAs: "number",
        value: 0,
        errorMessage: "A value must be provided when a limit is enabled",
      },
    },
    startTime: {
      toggle: {
        label: "Enable start time",
        type: "checkbox",
        value: false,
      },
      field: {
        label: "Add a start time (UTC)",
        placeholder: "",
        type: "datetime-local",
        value: "",
        errorMessage: "A start time must be provided when enabled",
      },
    },
    endTime: {
      toggle: {
        label: "Enable end time",
        type: "checkbox",
        value: false,
      },
      field: {
        label: "Add an end time (UTC)",
        placeholder: "",
        type: "datetime-local",
        value: "",
        errorMessage: "An end time must be provided when enabled",
      },
    },
    recipients: {
      toggle: {
        label: "Limit recipient addresses",
        type: "checkbox",
        value: false,
      },
      field: {
        label: "Add a comma-separated elibility list",
        placeholder: "",
        type: "text",
        validateAs: "address-csv",
        value: "",
        errorMessage: "Recipients be provided when enabled",
      },
    },
  };

  const [fieldData, setFieldData] = useState(fields);

  const handleChange = useCallback(
    (key: string, value: any) => {
      const field = fieldData[key];
      field.field.value = value;
      const newField = { [`${key}`]: { ...field } };
      setFieldData({ ...fieldData, ...newField });
    },
    [fieldData]
  );

  const [isGated, setIsGated] = useState(false);

  const handleEnable = useCallback(
    (key: string, value: any) => {
      const field = fieldData[key];
      if (field.toggle) {
        field.toggle.value = value;
        if (key === "receipients") {
          setIsGated(value);
        }
        const newField = { [`${key}`]: { ...field } };
        setFieldData({ ...fieldData, ...newField });
      }
    },
    [fieldData]
  );

  const handleSubmit = useCallback(async () => {
    const data = { ...fieldData };
    const newObj: { [key in any]: any } = {};
    Object.entries(data).map(([key, value]) => {
      // If field enables other field, remove from result
      if (value.toggle && !value.toggle.value) return;

      // Validate/clean-up field contents
      const { validateAs, error, value: _value } = data[key].field;

      // If no field value, set error
      if (!value.field.value && value.field.required) {
        data[key].field.error = true;
        return;
      } else if (validateAs) {
        if (validateAs === "address-csv") {
          const val: string = _value as string;
          const addresses = val.split(",").map((v) => v.trim());
          if (addresses.some((a) => !a.startsWith("0x"))) {
            data[key].field.error = true;
          } else {
            data[key].field.error = false;
          }
        } else if (validateAs === "json") {
          try {
            JSON.parse(_value as string);
            data[key].field.error = false;
          } catch {
            data[key].field.error = true;
          }
        } else if (validateAs === "path") {
          if (_value) {
            data[key].field.error = !/[\w-]*/m.test(_value as string);
          }
        } else if (validateAs === "number") {
          value.field.value = parseInt(value.field.value as string);
        } else {
          data[key].field.error = false;
        }
      }

      newObj[key as string] = value.field.value;
    });

    // If has errors, do not submit
    if (Object.entries(data).some(([key, value]) => value.field.error)) {
      setFieldData(data);
      return;
    }

    // sign newObj
    const signature = await signMessageAsync({
      message: JSON.stringify(newObj),
    });
    newObj.createdByAddress = address;
    // newObj.address = await address;
    newObj.signature = await signature;

    newObj.gated = isGated;

    const res = await fetch("/api/v2/drops/create", {
      method: "POST",
      body: JSON.stringify({ ...newObj }),
    });

    const json = await res.json();

  }, [fieldData, address, isGated, signMessageAsync]);

  const Toggle: FC<{
    toggle?: { label: string; value: boolean };
    fieldKey: keyof typeof fields;
  }> = ({ toggle, fieldKey }) => {
    if (!toggle || !fieldData[fieldKey].toggle) return null;

    return (
      <div className={`block rounded bg-slate-800 p-4 mb-6`}>
        <label className="relative inline-flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              checked={fieldData[fieldKey as string].toggle?.value}
              onChange={(e) =>
                handleEnable(fieldKey as string, e.target.checked)
              }
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </div>
          <span className="block ml-4">{toggle.label}</span>
        </label>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>My page title</title>
      </Head>
      <main className="max-w-7xl p-4 mx-auto flex items-start mb-auto w-full">
        <div className="max-w-2xl w-full mr-12 text-xl">
         <DropForm />
          {/* <button
            onClick={handleSubmit}
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Publish Drop
          </button> */}
        </div>
        {/* <Credential
          title={fieldData.name.field.value as string}
          data={{
            image: fieldData.image.field.value as string,
            credentialSubject: fieldData.subjectData.field.value as string,
          }}
        /> */}
      </main>
    </>
  );
}

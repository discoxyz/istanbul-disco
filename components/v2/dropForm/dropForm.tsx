"use client";
import {
  ClipboardEvent,
  FC,
  Key,
  createRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import { fields } from "./fields";
import { Prisma } from "@prisma/client";
import { Button } from "../button";
import { useAccount, useSignMessage } from "wagmi";
import { recoverMessageAddress } from "viem";
import { ToastError, ToastLoading, ToastSuccess } from "../toast";
import { useRouter } from "next/navigation";
import { getPathAvailability } from "../../../app/services/getPathAvalability";
import Form from "@rjsf/core";
import { schemas } from "../../../lib/schemas";
import validator from "@rjsf/validator-ajv8";
import { Toggle } from "../toggle";

type DropProps = Prisma.DropGetPayload<{}> & {
  claims: Prisma.ClaimGetPayload<{}>[];
};

export const DropForm: FC<{
  drop?: DropProps;
  refreshData?: () => void;
  setDrop?: (args: {
    name?: string;
    subjectData?: { [key: Key]: any };
    image?: string;
    schema?: string;
    createdByAddress?: string;
  }) => void;
}> = ({ drop: _drop, setDrop = () => null, refreshData }) => {
  const formRef = createRef<any>();
  // Set fields using drop data, if available
  // This means the form can be re-used for editing and creating
  const router = useRouter();
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  // const { recoverMessageAddress } = rec

  const [fieldData, setFieldData] = useState(fields);
  const [hideClaims, setHideClaims] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (_drop) {
      const _fields = fields;
      Object.entries(_fields).map(([key, value]) => {
        if (key === "claims") {
          _fields[key].field.value =
            _drop[key].map((c) => c.address) || value.field.value;
          return;
        }
        if (value.field.type === "checkbox") {
          _fields[key].field.value = (_drop as any)[key];
        } else {
          _fields[key].field.value = (_drop as any)[key] || value.field.value;
        }
      });

      if (_fields?.claims?.toggle) {
        _fields.claims.toggle.value = _drop.gated || false;
      }

      setFieldData(_fields);
      console.log("INIT DATA", _drop?.subjectData);
      setSubjectData(_drop?.subjectData);
      setSchemaError(undefined);
      setSelectedSchema(
        schemas.find((s) => s?.schema.$id === _drop?.schema)?.name,
      );
    }

    console.log(schemas[2]?.schema.properties.credentialSubject);
  }, []);

  const [pathAvailable, setPathAvailable] = useState<undefined | boolean>();
  const [pathLoading, setPathLoading] = useState<boolean>(false);

  const [loadedPath, setLoadedPath] = useState<
    { path: string; loaded: string } | undefined
  >();

  const handleChange = useCallback(
    async (key: string, value: any, arrayKey?: number) => {
      console.log('Change', key, value)
      const _fieldData = fieldData;
      if (arrayKey !== undefined) {
        (_fieldData[key].field.value as string[])[arrayKey] = value;
      } else {
        _fieldData[key].field.value = value;
      }
      // Idk why the value has to be spread. Not doing this will fail to update state
      setFieldData({ ..._fieldData });

      if (key === "path") setPathAvailable(undefined);

      const invalid = /[^A-Za-z0-9]/.test(value);

      if (key === "path" && value) {
        if (value === _drop?.path) {
          setPathLoading(false);
          setPathAvailable(true);
          return;
        } else if (invalid) {
          _fieldData[key].field.error = true;
          _fieldData[key].field.errorMessage =
            "No special characters or spaces";
          setFieldData({ ..._fieldData });
          setPathLoading(false);
          setPathAvailable(undefined);
          return;
        } else {
          // Reset err to false and error message
          _fieldData[key].field.error = false;
          _fieldData[key].field.errorMessage =
            fieldData[key].field.errorMessage;
          setPathLoading(true);
          const data = await getPathAvailability(value, setLoadedPath);
          if (data) {
            setPathLoading(false);
            setPathAvailable(data.available);
          }
        }
      }
    },
    [fieldData],
  );

  const addArrItem = useCallback(
    (key: string) => {
      const _fieldData = fieldData;
      (_fieldData[key].field.value as string[]).push("");
      setFieldData({ ...fieldData });
    },
    [fieldData],
  );

  const handleRemove = useCallback(
    (key: string, value: any, arrayKey: number) => {
      const _fieldData = fieldData;
      delete (_fieldData[key].field.value as string[])[arrayKey];
      setFieldData({ ..._fieldData });
    },
    [fieldData],
  );

  const handlePaste = useCallback(
    (
      key: string,
      event: ClipboardEvent<HTMLInputElement>,
      arrayKey: number,
    ) => {
      event.stopPropagation(), event.preventDefault();
      const _fieldData = fieldData;
      const string = event.clipboardData.getData("text");
      const arr = string.split(",");
      if (arr) {
        let i = arrayKey;
        arr.map((value, _key) => {
          const f = _fieldData[key].field.value as string[];
          function setVals() {
            if ((_fieldData[key].field.value as string[])[i] === "") {
              (_fieldData[key].field.value as string[])[i] = value;
            } else if ((_fieldData[key].field.value as string[])[i]) {
              i++;
              setVals();
            } else {
              (_fieldData[key].field.value as string[]).push(value);
            }
          }
          setVals();
        });
        setFieldData({ ..._fieldData });
      } else {
        (_fieldData[key].field.value as string[])[arrayKey] = string.trim();
      }
    },
    [fieldData],
  );

  const handleEnable = useCallback(
    (key: string, value: any) => {
      const field = fieldData[key];
      const toggleTarget =
        field.field?.type === "checkbox"
          ? "checkbox"
          : field.toggle
          ? "toggle"
          : undefined;
      if (!toggleTarget) return null;

      if (toggleTarget === "toggle" && field.toggle) {
        field.toggle.value = value;
      } else if (toggleTarget === "checkbox") {
        field.field.value = value;
      }

      const newField = { [`${key}`]: { ...field } };
      setFieldData({ ...fieldData, ...newField });
    },
    [fieldData],
  );

  const [selectedSchema, setSelectedSchema] = useState<undefined | string>();
  const [cleanSchema, setCleanSchema] = useState<undefined | any>();
  const [subjectData, setSubjectData] = useState<any>(undefined);
  const [schemaError, setSchemaError] = useState<string | undefined>();

  const handleFormData = (e: any) => {
    console.log("FORMMMMM", e);
    setSubjectData(e.formData);
  };
  useEffect(() => {
    // console.log('setDrop', fieldData.image.field.value)
    console.log("FROM DATA", subjectData);
    setDrop({
      createdByAddress: address,
      name: (fieldData.name.field.value as string) || "",
      image:
        (fieldData.image.field.value as string) ||
        "https://fzt.aqp.mybluehost.me/images/bg_disco.png",
      subjectData: subjectData,
      schema: selectedSchema,
    });
  }, [address, selectedSchema, fieldData, subjectData]);

  const handleSubmit = useCallback(async () => {
    // setSubmitting(true);
    const data = { ...fieldData };
    const newObj: { [key in any]: any } = {};
    Object.entries(data).map(([key, value]) => {
      // If field enables other field, remove from result
      if (key === "id" || key === "createdBy") return;
      // if ( value.toggle && !value.toggle.value) return;

      // Validate/clean-up field contents
      const { validateAs, error, value: _value } = data[key].field;

      // If no field value, set error
      if (!value.field.value && value.field.required) {
        data[key].field.error = true;
        return;
      } else if (validateAs) {
        // if (validateAs === '')
        if (validateAs === "json") {
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

    if (!selectedSchema) {
      setSchemaError("No schema selected.");
      setError("No schema selected");
      return;
    }

    newObj.subjectData = JSON.stringify(subjectData);

    // Add gated prop
    newObj.gated = data.claims.toggle?.value;

    // Add schema prop
    newObj.schema = schemas.find((s) => s?.name === selectedSchema)?.schema.$id;

    // If has errors, do not submit
    if (Object.entries(data).some(([key, value]) => value.field.error)) {
      setFieldData(data);
      // setSubmitting(false)
      setError("Errors. Not submitting");
      return;
    }
    console.log("SUBJECT", subjectData);
    if (
      !formRef?.current?.validateForm() &&
      Object.keys(cleanSchema?.properties).length &&
      cleanSchema?.required.length
    ) {
      setSchemaError("Schema fields are invalid");
      setError("Schema fields are invalid");
      return;
    } else {
      setSchemaError(undefined);
    }
    setSubmitting(true);

    if (_drop && _drop.createdByAddress !== address) {
      console.error("Created by address does not match current address");
      setSubmitting(false);
      return;
    }

    let signature;
    try {
      signature = await signMessageAsync({
        message: JSON.stringify(newObj),
      });
    } catch (err) {
      setSubmitting(false);
      setError("Message not signed");
    }

    const recoveredAddress = await recoverMessageAddress({
      message: JSON.stringify(newObj),
      signature: signature as `0x${string}`,
    });

    if (_drop && recoveredAddress === _drop?.createdByAddress) {
      console.error("Message was signed by another address");
    }
    newObj.createdByAddress = address;
    // newObj.address = await address;
    newObj.signature = await signature;
    newObj.id = _drop?.id || undefined;

    const res = await fetch("/api/v2/drops/create", {
      method: "POST",
      body: JSON.stringify({ ...newObj }),
    });

    const json = await res.json();
    if (!_drop?.id) {
      router.push(`/active/${newObj.path}?created=true`);
    }
    if (refreshData) {
      await refreshData();
    }
    setSubmitting(false);
    setSubmitted(true);
  }, [
    fieldData,
    address,
    _drop,
    signMessageAsync,
    selectedSchema,
    subjectData,
    formRef,
  ]);

  useEffect(() => {
    if (!selectedSchema) {
      setCleanSchema(undefined);
      return;
    }

    let s = schemas.find((s) => s?.name === selectedSchema)?.schema.properties
      .credentialSubject;
    delete s?.properties?.id;
    const i = s?.required?.indexOf("id");
    if (i !== -1) {
      s?.required.splice(i, 1);
    }

    setCleanSchema(s);
  }, [selectedSchema]);

  return (
    <div className="mr-12 w-full max-w-2xl text-xl">
      <h2 className="mb-4 mt-12 flex px-4 text-2xl">
        {_drop?.id ? "Update Drop" : "Create Drop"}
      </h2>
      <div className="rounded-3xl bg-stone-950 p-6">
        {Object.entries(fieldData).map(([key, value]) => {
          const disabled = value.toggle && !value.toggle.value;
          const helperText =
            (value.field.helper &&
              value.field.helper.replace(
                /{.*}/,
                value.field.value as string,
              )) ||
            value.field.helper;
          return (
            <div
              key={key}
              className={`block ${
                value.toggle && "my-8 rounded-xl border border-white/20 p-4"
              }`}
            >
              {value.toggle && (
                <Toggle
                  label={value.toggle.label}
                  checked={value.toggle.value}
                  value={`${key}-toggle`}
                  onChange={(e) =>
                    handleEnable(key as string, e.target.checked)
                  }
                  className="my-4"
                />
              )}

              <div className={`mb-6 block ${disabled && "hidden"}`}>
                {value.field.type === "text-arr" ? (
                  <>
                    <label className="my-3 flex">
                      {value.field.label}
                      <span className="ml-auto">Hide Claims</span>
                      {!!_drop?.claims.find((c) => c.claimed === true) ? (
                        <input
                          className="disabled:cursor-wait"
                          disabled={submitting}
                          type="checkbox"
                          onChange={() => setHideClaims(!hideClaims)}
                        />
                      ) : null}
                    </label>
                    {(value.field.value as string[]).map(
                      (a: string, _key: number) => {
                        const claim = _drop?.claims.find(
                          (c) => c.address === a,
                        );
                        return (
                          <div className="relative my-3 " key={_key}>
                            <input
                              className="block w-full rounded-lg border-gray-600 bg-gray-700  p-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-400"
                              disabled={
                                submitting ||
                                !!_drop?.claims.find(
                                  (c) => c.address === a && c.claimed,
                                )
                              }
                              required={
                                value.field.required ||
                                disabled !== false ||
                                undefined
                              }
                              type={"text"}
                              value={a}
                              onPaste={(e) => handlePaste(key, e, _key)}
                              onChange={(e) =>
                                handleChange(key, e.target.value, _key)
                              }
                            />

                            <span className="absolute right-4 top-3 opacity-60">
                              {claim && claim.claimed ? (
                                "Claimed"
                              ) : (
                                <button
                                  onClick={(e) => handleRemove(key, e, _key)}
                                >
                                  Remove
                                </button>
                              )}
                            </span>
                          </div>
                        );
                      },
                    )}

                    <button onClick={() => addArrItem(key)}>add</button>
                  </>
                ) : value.field.type === "textarea" ? (
                  <>
                    <label className="block">{value.field.label}</label>
                    <textarea
                      value={value.field.value as string}
                      onChange={(e) => handleChange(key, e.target.value)}
                      disabled={submitting || disabled}
                      className="block w-full rounded-lg border border-gray-600 bg-gray-700  p-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-wait disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-400"
                    />
                  </>
                ) : value.field.type === "checkbox" ? (
                  <Toggle
                    className="my-4"
                    value={key}
                    label={value.field.label}
                    checked={value.field.value as boolean}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    helperText={value.field.helper}
                  />
                ) : (
                  <>
                    <label className="mb-2 block">{value.field.label}</label>
                    <input
                      className="text-gray-900rounded-lg block w-full border  border-gray-600 bg-gray-700 p-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-wait disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-400"
                      disabled={submitting || disabled}
                      required={
                        value.field.required || disabled !== false || undefined
                      }
                      type={value.field.type}
                      value={value.field.value as string | number}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  </>
                )}
                {value.field.type !== "checkbox" && (
                  <p className="flex text-slate-400">
                    {helperText}{" "}
                    {key === "path" &&
                      value.field.value &&
                      !value.field.error &&
                      (pathLoading || loadedPath?.path !== value.field.value ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="ml-auto h-6 w-6 animate-spin"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
                          />
                        </svg>
                      ) : pathAvailable === true ? (
                        <span className="ml-auto text-green-500">Avalable</span>
                      ) : (
                        pathAvailable === false && (
                          <span className="ml-auto text-red-500">
                            Not avaliable
                          </span>
                        )
                      ))}
                  </p>
                )}
                <p className="mb-2 text-fuchsia-300">
                  {value.field.error && value.field.errorMessage}
                </p>
              </div>
            </div>
          );
        })}
        <div className="my-8 rounded-xl border border-white/20 p-4">
          <label className="mb-2 block">Select a schema</label>
          <select
            placeholder="'Select a schema"
            id="countries"
            value={selectedSchema}
            onChange={(e) => {
              setSubjectData({});
              setSelectedSchema(e?.target?.value || "undefined");
            }}
            className=" block  w-full rounded-lg border-gray-600 bg-gray-700 p-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="DEFAULT" disabled={!!selectedSchema}>
              Choose a Schema
            </option>
            {schemas.map((s, key) => (
              <option key={key} value={s?.name}>
                {s?.name}
              </option>
            ))}
          </select>
          <p className="text-red-600">{schemaError && schemaError}</p>
          {selectedSchema && cleanSchema ? (
            <Form
              formData={subjectData || {}}
              ref={formRef}
              schema={cleanSchema}
              validator={validator}
              onChange={handleFormData}
              uiSchema={{
                "ui:order": [
                  ...cleanSchema.required,
                  "*",
                  "startDate",
                  "endDate",
                  "expiration",
                ],
              }}
            />
          ) : null}
        </div>

        <Button onClick={handleSubmit}>
          {_drop?.id ? "Update Drop" : "Create Drop"}
        </Button>
      </div>
      <div className="fixed bottom-0 flex w-full flex-col items-center">
        {submitting && <ToastLoading text="Submitting"></ToastLoading>}
        {error && (
          <ToastError text={error} onDismiss={() => setError(undefined)} />
        )}
        {submitted && (
          <ToastSuccess
            text="Submitted"
            onDismiss={() => setSubmitted(false)}
          />
        )}
      </div>
    </div>
  );
};

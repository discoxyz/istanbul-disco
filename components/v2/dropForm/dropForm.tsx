"use client";
import {
  ClipboardEvent,
  FC,
  Key,
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

type DropProps = Prisma.DropGetPayload<{}> & {
  claims: Prisma.ClaimGetPayload<{}>[];
};

export const DropForm: FC<{ drop?: DropProps; refreshData?: () => void }> = ({
  drop: _drop,
  refreshData,
}) => {
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
          console.log("MANAGE CHECKBOX");
          console.log((_drop as any)[key]);
          _fields[key].field.value = (_drop as any)[key];
        } else {
          _fields[key].field.value = (_drop as any)[key] || value.field.value;
        }
      });

      if (_fields?.claims?.toggle) {
        _fields.claims.toggle.value = _drop.gated || false;
      }

      setFieldData(_fields);
    }
  }, []);

  const [pathAvailable, setPathAvailable] = useState<undefined | boolean>();
  const [pathLoading, setPathLoading] = useState<boolean>(false);

  const handleChange = useCallback(
    async (key: string, value: any, arrayKey?: number) => {
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
        console.log(value, _drop?.path);
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
          const data = await getPathAvailability(value);
          setPathLoading(false);
          setPathAvailable(data.available);
        }
      }
    },
    [fieldData]
  );

  const addArrItem = useCallback(
    (key: string) => {
      const _fieldData = fieldData;
      (_fieldData[key].field.value as string[]).push("");
      setFieldData({ ...fieldData });
    },
    [fieldData]
  );

  const handleRemove = useCallback(
    (key: string, value: any, arrayKey: number) => {
      const _fieldData = fieldData;
      delete (_fieldData[key].field.value as string[])[arrayKey];
      setFieldData({ ..._fieldData });
    },
    [fieldData]
  );

  const handlePaste = useCallback(
    (
      key: string,
      event: ClipboardEvent<HTMLInputElement>,
      arrayKey: number
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
    [fieldData]
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
      console.log(toggleTarget, value);

      if (toggleTarget === "toggle" && field.toggle) {
        field.toggle.value = value;
        console.log("TOGGLE", value);
      } else if (toggleTarget === "checkbox") {
        field.field.value = value;
      }

      console.log(field);

      const newField = { [`${key}`]: { ...field } };
      setFieldData({ ...fieldData, ...newField });
    },
    [fieldData]
  );

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

    // Add gated prop
    newObj.gated = data.claims.toggle?.value;

    // If has errors, do not submit
    if (Object.entries(data).some(([key, value]) => value.field.error)) {
      setFieldData(data);
      // setSubmitting(false)
      setError("Errors. Not submitting");
      return;
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
  }, [fieldData, address, _drop, signMessageAsync]);

  const Toggle: FC<{
    className?: string;
    toggle?: { label: string; value: boolean; helperText?: string };
    fieldKey: keyof typeof fields;
  }> = ({ toggle, fieldKey, className }) => {
    let proceed = false;
    if (toggle || fieldData[fieldKey].toggle) proceed = true;
    if (fieldData[fieldKey]?.field?.type === "checkbox") proceed = true;
    if (!proceed) return null;

    return (
      <label
        className={`relative inline-flex items-center cursor-pointer ${className}`}
      >
        <div className="relative">
          <input
            type="checkbox"
            value=""
            className="sr-only peer"
            checked={
              fieldData[fieldKey as string].toggle?.value ||
              fieldData[fieldKey as string].field.value === true
            }
            onChange={(e) => handleEnable(fieldKey as string, e.target.checked)}
          />
          <div className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4  peer-focus:ring-blue-800 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-gray-600 peer-checked:bg-blue-600"></div>
        </div>
        <div className="ml-4">
          <span className="block ">{toggle?.label}</span>
          <span className="bloxk text-slate-400 text-m">
            {toggle?.helperText}
          </span>
        </div>
      </label>
    );
  };

  return (
    <div className="max-w-2xl w-full mr-12 text-xl">
      <h2 className="text-2xl px-4 mt-12 mb-4 flex">
        {_drop?.id ? "Update Drop" : "Create Drop"}
      </h2>
      <div className="bg-stone-950 rounded-3xl p-6">
        {Object.entries(fieldData).map(([key, value]) => {
          const disabled = value.toggle && !value.toggle.value;
          const helperText =
            (value.field.helper &&
              value.field.helper.replace(
                /{.*}/,
                value.field.value as string
              )) ||
            value.field.helper;
          console.log(value.field);
          return (
            <div
              key={key}
              className={`block ${
                value.toggle && "rounded bg-slate-800 p-4 my-8"
              }`}
            >
              {value.toggle && (
                <Toggle toggle={value.toggle} fieldKey={key} className="my-4" />
              )}

              <div className={`block mb-6 ${disabled && "hidden"}`}>
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
                          (c) => c.address === a
                        );
                        return (
                          <div className="relative my-3 " key={_key}>
                            <input
                              className="disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg  block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                              disabled={
                                submitting ||
                                !!_drop?.claims.find(
                                  (c) => c.address === a && c.claimed
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

                            <span className="absolute top-3 right-4 opacity-60">
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
                      }
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
                      className="disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-wait border rounded-lg  block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                      // pattern={value.field.pattern}
                    />
                  </>
                ) : value.field.type === "checkbox" ? (
                  <Toggle
                    className="my-4"
                    toggle={{
                      label: value.field.label,
                      value: value.field.value as boolean,
                      helperText: value.field.helper,
                    }}
                    fieldKey={key}
                  />
                ) : (
                  <>
                    <label className="block mb-2">{value.field.label}</label>
                    <input
                      className="disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-wait  border text-gray-900rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                      disabled={submitting || disabled}
                      required={
                        value.field.required || disabled !== false || undefined
                      }
                      type={value.field.type}
                      value={value.field.value as string | number}
                      // pattern={value.field.pattern}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  </>
                )}
                {value.field.type !== "checkbox" && (
                  <p className="text-slate-400 flex">
                    {helperText}{" "}
                    {key === "path" &&
                      value.field.value &&
                      !value.field.error &&
                      (pathLoading ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6 animate-spin ml-auto"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
                          />
                        </svg>
                      ) : pathAvailable === true ? (
                        <span className="text-green-500 ml-auto">Avalable</span>
                      ) : (
                        pathAvailable === false && (
                          <span className="text-red-500 ml-auto">
                            Not avaliable
                          </span>
                        )
                      ))}
                  </p>
                )}
                <p className="text-red-600">
                  {value.field.error && value.field.errorMessage}
                </p>
              </div>
            </div>
          );
        })}
        <Button onClick={handleSubmit}>
          {_drop?.id ? "Update Drop" : "Create Drop"}
        </Button>
      </div>
      <div className="fixed bottom-0 w-full flex items-center flex-col">
        {/* {submitting && <Toast text="Updating" />}
        {error && <Toast text="Error" onDismiss={() => setError(undefined)} />}
        {submitted && (
          <ToastLoading text="Submitted" onDismiss={() => setSubmitted(false)} />
        )} */}
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

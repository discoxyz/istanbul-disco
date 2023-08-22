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
import { redirect } from "next/navigation";

type DropProps = Prisma.DropGetPayload<{}> & {
  claims: Prisma.ClaimGetPayload<{}>[];
};

export const DropForm: FC<{ drop?: DropProps; refreshData?: () => void }> = ({
  drop: _drop,
  refreshData,
}) => {
  // Set fields using drop data, if available
  // This means the form can be re-used for editing and creating
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

        // if (key === 'toggle')
        _fields[key].field.value = (_drop as any)[key] || value.field.value;
      });

      if (_fields?.claims?.toggle) {
        _fields.claims.toggle.value = _drop.gated || false;
      }

      setFieldData(_fields);
    }
  }, []);

  const handleChange = useCallback(
    (key: string, value: any, arrayKey?: number) => {
      const _fieldData = fieldData;
      if (arrayKey !== undefined) {
        (_fieldData[key].field.value as string[])[arrayKey] = value;
      } else {
        _fieldData[key].field.value = value;
      }
      // Idk why the value has to be spread. Not doing this will fail to update state
      setFieldData({ ..._fieldData });
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
      if (field.toggle) {
        field.toggle.value = value;
        const newField = { [`${key}`]: { ...field } };
        setFieldData({ ...fieldData, ...newField });
      }
    },
    [fieldData]
  );

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
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
      setError("Errors. Not submitting");
      return;
    }

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
      return redirect(`/active/${newObj.path}?created=true`);
    }
    if (refreshData) {
      await refreshData();
    }
    setSubmitting(false);
    setSubmitted(true);
  }, [fieldData, address, _drop, signMessageAsync]);

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

          return (
            <div
              key={key}
              className={`block ${
                value.toggle && "rounded bg-slate-800 p-4 mb-6"
              }`}
            >
              <Toggle toggle={value.toggle} fieldKey={key} />

              <div className={`block mb-6 ${disabled && "hidden"}`}>
                {value.field.type === "text-arr" ? (
                  <>
                    <label className="mb-2 flex">
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
                          <div className="relative mb-3 " key={_key}>
                            <input
                              className="disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed bg-gray-50 border border-gray-300 text-gray-900rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                      className="disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-wait bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      // pattern={value.field.pattern}
                    />
                  </>
                ) : (
                  <>
                    <label className="block mb-2">{value.field.label}</label>
                    <input
                      className="disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-wait bg-gray-50 border border-gray-300 text-gray-900rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                <p className="text-slate-400">{helperText}</p>

                <p className="text-red-600">
                  {value.field.error && value.field.errorMessage}
                </p>
              </div>
            </div>
          );
        })}
        <Button onClick={handleSubmit} >
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

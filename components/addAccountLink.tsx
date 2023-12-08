import { ChangeEvent, FC, useCallback, useState } from "react";

const validLinks = ["twitter", "website", "instagram", "telegram"] as const;
type LinkType = (typeof validLinks)[number];

export interface AccountLinkCreate {
  type?: string;
  username?: string;
  valid?: boolean;
}

export const AddAccountLink: FC<{
  callback: (args: AccountLinkCreate) => void;
}> = ({ callback: _callback }) => {
  const [type, setType] = useState<LinkType | undefined>();
  const [username, setUsername] = useState<string>("");

  const handleUsername = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setUsername(e.currentTarget.value);
      callback({ type, username: e.currentTarget.value });
    },
    [type],
  );

  const handleSelect = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setType(e.currentTarget.value as LinkType);
      callback({ type: e.currentTarget.value, username });
    },
    [username],
  );

  const callback = (args: { type?: string; username?: string }) => {
    let valid = true;
    if (!args?.type || !args.username?.length) {
      valid = false;
    }
    _callback({ type: args.type, username: args.username, valid });
  };

  return (
    <div className="w-full">
      <label className="mb-2 text-lg">Create account link</label>
      <div className="grid grid-cols-3 gap-3">
        <select
          value={type || "empty"}
          // defaultValue="empty"
          onChange={handleSelect}
          className="col-span-1"
        >
          <option value="empty" disabled className="col-span-1">
            Type
          </option>
          {validLinks.map((l, i) => (
            <option key={i} value={l}>
              {l}
            </option>
          ))}
        </select>
        <input
          className="col-span-2"
          type="text"
          value={username}
          onChange={handleUsername}
        />
      </div>
    </div>
  );
};

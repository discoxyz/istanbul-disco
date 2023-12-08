export const parseAccountLink = (type: string, username: string) => {
  let href;
  let handle = username;
  let valid = false;

  handle = handle.replace("https://", "");
  handle = handle.replace("http://", "");
  handle = handle.replace("www.", "");

  if (type === "twitter") {
    handle = handle.replace("twitter.com/", "");
    handle = handle.replace("@", "");
    href = "https://twitter.com/" + username;
    valid = true;
  }

  if (type === "website") {
      handle = "https://" + handle;
    href = handle;
    valid = true;
  }

  if (type === "telegram") {
    handle = handle.replace("instagram.com/", "");
    handle.replace("@", "");
    href = "https://t.me/" + handle;
    valid = true;
  }

  if (type === "instagram") {
    username.replace("@", "");
    handle = handle.replace("instagram.com/", "");
    href = "https://instagram.com/" + handle;
    valid = true;
  }

  if (/^[a-z0-9]+$/i.test(username)) {
    valid = false;
  }

  return {
    valid,
    username: handle,
    type,
    href,
  };
};

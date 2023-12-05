export const emailRegex = new RegExp(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/);
export const ethAddressRegex = new RegExp(
  /(?:^did:ethr:|^did:pkh:eip155:1:)(0x[A-Fa-f0-9]{40}$)|^0x[A-Fa-f0-9]{40}$/,
);


export const parseId = (id: string) => {
  if (emailRegex.test(id)) {
    // Raw email
    return id.toLowerCase();
  } else if (ethAddressRegex.test(id)) {
    return `did:ethr:${id.toLowerCase()}`;
  }
  throw new Error('Invalid ID')
}
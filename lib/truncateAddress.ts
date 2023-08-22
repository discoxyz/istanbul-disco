import { Address } from "viem";

export const truncateAddress = (address: Address) => {
  let t = address.slice(0, 6);
  t += "...";
  t += address.slice(-4);
  return t;
};

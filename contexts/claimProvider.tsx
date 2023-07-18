import { useAccount } from "wagmi";
import { useDid3Context } from "./did3Context";
import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const base = {
  did: undefined,
  address: undefined,
  isLoading: true,
};

const Context = createContext<{
  did?: string;
  isLoading?: boolean;
  address?: string;
}>(base);

export const ClaimProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { isConnected, address } = useAccount();
  const { isCeramicConnected, did3 } = useDid3Context();
  const [did, setDid] = useState<string | undefined>();
  const [newAddress, setNewAddress] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (address) {
      const setUser = async () => {
        setIsLoading(true);
        const user = await fetch("/api/users/claim", {
          method: "POST",
          body: JSON.stringify({
            address: address,
            did3: did3 || undefined,
          }),
        });
        const json = await user.json();
        setDid(json.data.Did3);
        setNewAddress(json.data.Address);
        setIsLoading(false);
      };
      setUser();
    }
  }, [address, did3]);

  const value = {
    isLoading: isLoading,
    did: did,
    address: newAddress,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useDataContext = () => useContext(Context);

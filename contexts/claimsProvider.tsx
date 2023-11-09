import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useState,
} from "react";
import { ShareModal } from "../components/shareModal";
import { useAuth } from "./authProvider";

interface ClaimsContextInterface {
  getMyClaims: (page?: number) => void;
  getClaimedMine: (page?: number) => void;
  loading: boolean;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  page?: number
  data?: {
    address: String;
    time: string;
  }[];
}

const claimsContext = createContext<ClaimsContextInterface>({
  getMyClaims: () => {},
  getClaimedMine: () => {},
  loading: false,
});

export const ClaimsProvider: FC<PropsWithChildren> = ({
  children,
  ...rest
}) => {
  const { address } = useAuth();

  const [claims, setClaims] = useState<{
    loading: boolean;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
    page?: number
    data?: {
      address: String;
      time: string;
    }[];
  }>({
    loading: false,
  });

  const _get = async (type: "myClaims" | "claimedMine", page: number = 1) => {
    setClaims({
      loading: true,
    });
    const claimed = await fetch("/api/istanbul/getUserClaims", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page,
        address,
        type: type === "myClaims" ? "owner" : "claimant",
      }),
    });
    const result = await claimed.json();
    setClaims({
      loading: false,
      ...result,
    });
  };

  const getMyClaims = (page?: number) => {
    _get("myClaims", page);
  };

  const getClaimedMine = (page?: number) => {
    _get("claimedMine", page);
  };

  const value = {
    getMyClaims,
    getClaimedMine,
    ...claims,
  };

  return (
    <claimsContext.Provider value={value} {...rest}>
      {children}
      <ShareModal />
    </claimsContext.Provider>
  );
};

export const useClaims = () => useContext(claimsContext);

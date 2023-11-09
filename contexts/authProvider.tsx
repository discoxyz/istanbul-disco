import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { SiweMessage } from "siwe";
import { getEnsName } from "viem/ens";
import {
  Address,
  useAccount,
  useChainId,
  useConnect,
  useEnsName,
  useNetwork,
  usePublicClient,
  useSignMessage,
} from "wagmi";
import { truncateAddress } from "../lib/truncateAddress";
import { useConnectModal } from "@rainbow-me/rainbowkit";

interface AuthenticateArgs {
  onSuccess?: (args: { address: string }) => Promise<void>;
  onError?: (args: { error: Error }) => Promise<void>;
}

interface AuthProviderContext {
  address?: Address;
  name?: string;
  awaitingAuth?: boolean;
  authenticated?: boolean;
  loading?: boolean;
  nonce?: string;
  error?: Error;
  authenticate: (args?: AuthenticateArgs) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const initContext: AuthProviderContext = {
  authenticated: false,
  loading: false,
  authenticate: () => {
    throw new Error("Not ready");
  },
  logout: () => {
    throw new Error("Not ready");
  },
  refreshUser: () => {
    throw new Error("Not ready");
  },
};

const authProviderContext = createContext(initContext);

export const AuthProvider: FC<PropsWithChildren> = (props) => {
  const { signMessageAsync } = useSignMessage();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { chain } = useNetwork();
  const { data, isLoading } = useEnsName();
  const { openConnectModal } = useConnectModal();

  const [state, setState] = useState<{
    address?: Address;
    authenticated?: boolean;
    loading?: boolean;
    nonce?: string;
    error?: Error;
  }>({
    loading: true,
    authenticated: false,
    nonce: undefined,
  });

  const [awaitingAuth, setAwaitingAuth] = useState(false);

  // Fetch user when:
  useEffect(() => {
    console.log("onload");
    refreshUser();
    return;

    // 2. window is focused (in case user logs out of another window)
    // window.addEventListener("focus", handler);
    // return () => window.removeEventListener("focus", handler);
  }, []);

  const _fetchNonce = async () => {
    try {
      const nonceRes = await fetch("/api/istanbul/auth/nonce");
      const nonce = await nonceRes.text();
      setState((x) => ({ ...x, nonce }));
      return nonce;
    } catch (error) {
      setState((x) => ({ ...x, error: error as Error }));
    }
  };
  const [awaitingConnection, setIsAwaitingConnection] = useState(false);
  const [callback, setCallback] = useState<AuthenticateArgs>({
    onSuccess: async () => {},
    onError: async () => {},
  });

  // Callback for when the wallet connection is complete
  // Should only be set via authenticate({onSuccess, onError})
  useEffect(() => {
    if (!awaitingConnection || !isConnected || !address) return;
    const { onSuccess, onError } = callback;
    authenticate({
      onSuccess,
      onError,
    });
    setIsAwaitingConnection(false);
    setCallback({});
  }, [awaitingConnection, isConnected, address, callback]);

  useEffect(() => {
    console.log(address, state.address);
    if (!address || !state.address) return;
    if (address !== state.address) logout();
  }, [address]);

  const authenticate = useCallback(
    async (args?: AuthenticateArgs) => {
      if (state.authenticated) return;
      if (!isConnected) {
        setIsAwaitingConnection(true);
        setCallback(args || {});
        openConnectModal && openConnectModal();
        return;
      }
      try {
        const chainId = chain?.id;
        if (!address || !chainId) return;

        setState((x) => ({ ...x, loading: true }));
        // Create SIWE message with pre-fetched nonce and sign with wallet
        const message = new SiweMessage({
          domain: window.location.host,
          address,
          statement: "Sign in with Ethereum to Disco",
          uri: window.location.origin,
          version: "1",
          chainId,
          nonce: await _fetchNonce(),
        });
        const signature = await signMessageAsync({
          message: message.prepareMessage(),
        });

        // Verify signature
        const verifyRes = await fetch("/api/istanbul/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message, signature }),
        });

        if (!verifyRes.ok) throw new Error("Error verifying message");
        const ens = await getEnsName(publicClient, { address });
        setState((x) => ({
          ...x,
          name: ens || truncateAddress(address),
          loading: false,
        }));
        args?.onSuccess && console.log("start onSuccess");
        // !onSuccess && console.log("No callback");
        args?.onSuccess && args.onSuccess({ address });
      } catch (error) {
        setState((x) => ({ ...x, loading: false, nonce: undefined }));
        args?.onError && args.onError({ error: error as Error });
        _fetchNonce();
      }
    },
    [openConnectModal, state.authenticated, awaitingAuth],
  );

  const logout = async () => {
    try {
      await fetch("/api/istanbul/auth/logout");
      setState({});
    } catch (err) {
      setState((x) => ({}));
    }
  };

  const refreshUser = async () => {
    try {
      setState((x) => ({
        ...x,
        loading: true,
      }));
      const res = await fetch("/api/istanbul/auth/me");
      const json = await res.json();
      if (json?.siwe?.data?.address) {
        const ens = await getEnsName(publicClient, {
          address: json.siwe.data.address,
        });
        setState((x) => ({
          ...x,
          name: ens || truncateAddress(json.siwe.data.address),
          loading: false,
          authenticated: true,
          address: json.siwe.data.address,
        }));
      } else {
        // Log out
        setState({
          authenticated: false,
          loading: false,
        });
      }
    } catch (_error) {
      console.log(_error);
    }
  };

  const value = {
    ...state,
    authenticate,
    logout,
    refreshUser,
  };

  return <authProviderContext.Provider value={value} {...props} />;
};

export const useAuth = () => useContext(authProviderContext);

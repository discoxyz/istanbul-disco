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
  useDisconnect,
  useNetwork,
  usePublicClient,
  useSignMessage,
} from "wagmi";
import { truncateAddress } from "../lib/truncateAddress";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useUser } from "@auth0/nextjs-auth0/client";

interface AuthenticateArgs {
  onSuccess?: (args: { address: string }) => Promise<void>;
  onError?: (args: { error: Error }) => Promise<void>;
}

interface AuthProviderContext {
  address?: string;
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
  //auth0
  const { user, error, isLoading } = useUser();

  // Wallet
  const { signMessageAsync } = useSignMessage();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();
  const { chain } = useNetwork();

  // Modal
  const { openConnectModal } = useConnectModal();

  const [state, setState] = useState<{
    address?: string;
    name?: string;
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
    refreshUser();
    return;

    // 2. window is focused (in case user logs out of another window)
    // window.addEventListener("focus", handler);
    // return () => window.removeEventListener("focus", handler);
  }, []);

  // const _fetchNonce = async () => {
  //   try {
  //     const nonceRes = await fetch("/api/auth/me");
  //     const nonce = await nonceRes.text();
  //     setState((x) => ({ ...x, loading: false, nonce }));
  //     return nonce;
  //   } catch (error) {
  //     setState((x) => ({ ...x, error: error as Error }));
  //   }
  // };
  const [awaitingConnection, setIsAwaitingConnection] = useState(false);
  const [callback, setCallback] = useState<AuthenticateArgs>({
    onSuccess: async () => {},
    onError: async () => {},
  });

  // Callback for when the wallet connection is complete
  // Should only be set via authenticate({onSuccess, onError})
  useEffect(() => {
    if (!awaitingConnection || !isConnected || !address) {
      return;
    }
    const { onSuccess, onError } = callback;
    authenticate({
      onSuccess,
      onError,
    });
    setIsAwaitingConnection(false);
    setCallback({});
  }, [awaitingConnection, isConnected, address, callback]);

  useEffect(() => {
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

        setState({ nonce: state.nonce, loading: true });
        setAwaitingAuth(true);
        // Create SIWE message with pre-fetched nonce and sign with wallet
        const message = new SiweMessage({
          domain: window.location.host,
          address,
          statement: "Sign in with Ethereum to Disco",
          uri: window.location.origin,
          version: "1",
          chainId,
          nonce: state.nonce,
        });
        const signature = await signMessageAsync({
          message: message.prepareMessage(),
        });

        // Verify signature
        const verifyRes = await fetch("/api/authWeb3", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message, signature }),
        });

        if (!verifyRes.ok) throw new Error("Error verifying message");
        const ens = await getEnsName(publicClient, { address });
        setAwaitingAuth(false);
        setState({
          nonce: state.nonce,
          authenticated: true,
          address: address,
          name: ens || truncateAddress(address) || undefined,
          loading: false,
        });

        args?.onSuccess && args.onSuccess({ address });
      } catch (error) {
        setAwaitingAuth(false);
        setState((x) => ({ ...x, loading: false, nonce: undefined }));
        args?.onError && args.onError({ error: error as Error });
      }
    },
    [openConnectModal, state.authenticated, awaitingAuth, state.nonce],
  );

  const logout = async () => {
    try {
      // log out web3 and auth0
      console.log("log out");
      await fetch("/api/authWeb3", { method: "DELETE" });
      console.log("logged out");
      // disconnect wallet
      disconnect();
      setState({});
    } catch (err) {
      setState((x) => ({}));
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      setState((x) => ({
        ...x,
        loading: true,
      }));
      const res = await fetch("/api/authWeb3");
      const json = await res.json();
      if (json?.siwe?.data?.address) {
        const ens = await getEnsName(publicClient, {
          address: json.siwe.data.address,
        });
        setState({
          ...state,
          name: ens || truncateAddress(json.siwe.data.address) || undefined,
          loading: false,
          authenticated: true,
          address: json.siwe.data.address,
        });
      } else if (json.nonce) {
        // Log out
        setState({
          nonce: json.nonce,
          authenticated: false,
          loading: false,
        });
      }
    } catch (_error) {
      console.error(_error);
    }
  }, [state]);

  const walletOrAuth0 = {
    address: user?.email ? user.email : state.address,
    name: user?.name ? user.name : state.name,
    authenticated: !!user?.name || state.authenticated,
    loading: isLoading || state.loading,
    nonce: state.nonce,
  };

  const value = {
    ...walletOrAuth0,
    authenticate,
    logout,
    refreshUser,
  };

  return <authProviderContext.Provider value={value} {...props} />;
};

export const useAuth = () => useContext(authProviderContext);

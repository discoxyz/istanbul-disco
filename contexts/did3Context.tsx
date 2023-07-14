import { FC, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CeramicClient } from '@ceramicnetwork/http-client'
import { Address, useAccount, useDisconnect } from "wagmi";
import { connect3ID } from "./utils/connect3ID";
import { DID } from "dids";
// import { WalletActions, useWallet } from "./utils/useWallet";

interface Did3ContextType {
  autoReconnectDid3: boolean;
  autoConnectDid3: boolean;
  ceramicClient?: CeramicClient;
  isCeramicConnected: boolean;
  isCeramicConnecting: boolean;
  isCeramicFailed: boolean;
  isMigratingUser?: boolean;
  did3?: string;
  did3Provider?: DID;
  connectCeramic: () => void;
  disconnectCeramic: () => void;
  // useWallet: () => WalletActions;
  openConnectionModal: (onClose?: () => void) => void;
  closeConnectionModal: () => void;
  isConnectionModalOpen: boolean;
  error: any;
  isError: boolean;
  streams: any[];
}

async function loadMulti(ceramicClient: CeramicClient, ids: any[] = []) {
  const queries = ids.map((streamId) => ({ streamId }))
  // This will return an Object of stream ID keys to stream values
  return await ceramicClient.multiQuery(queries)
}

const Did3Context = createContext<Did3ContextType>({
  autoReconnectDid3: true,
  autoConnectDid3: false,
  ceramicClient: undefined,
  isCeramicConnected: false,
  isCeramicConnecting: false,
  isCeramicFailed: false,
  did3: undefined,
  did3Provider: undefined,
  connectCeramic: () => {
    throw "Not initialized";
  },
  disconnectCeramic: () => {
    throw "Not initialized";
  },
  // useWallet: useWallet,
  openConnectionModal: () => {
    throw "Not initialized";
  },
  closeConnectionModal: () => {
    throw "Not initialized";
  },
  isConnectionModalOpen: false,
  error: undefined,
  isError: false,
  streams: [],
});

/**
 * Contains functionality to get a did:3 account
 * and authenticate with it. Must be wrapped in a wagmi provider.
 * @constructor
 * @param {boolean} autoConnectCeramic - Autoconnects to ceramic
 */
export const Did3Provider: FC<{
  autoConnectDid3: boolean;
  autoDisconnectDid3: boolean;
  autoReconnectDid3: boolean;
  children: React.ReactNode;
}> = ({ autoConnectDid3, autoReconnectDid3, autoDisconnectDid3, children, ...rest }) => {
  const ceramicClient = useMemo(
    () => new CeramicClient(process.env.NEXT_PUBLIC_CERAMIC_ENDPOINT),
    [],
  );

  const { isConnected, address, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const [isCeramicConnected, setIsCeramicConnected] = useState(false);
  const [isCeramicConnecting, setIsCeramicConnecting] = useState(false);
  const [isCeramicFailed, setIsCeramicFailed] = useState(false);
  const [did3, setDid3] = useState<string | undefined>(undefined);
  const [did3Provider, setDid3Provider] = useState<DID | undefined>(undefined);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<any>();

  // use to track address changes
  const [connectionAddress, setConnectionAddress] = useState<Address | undefined>(address);

  //  Use to handle modal open state
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState<boolean>(false);
  const [connectModalOnClose, setConnectModalOnClose] = useState<() => any>(() => () => null);

  const handleErr = (message: string, err: any) => {
    console.error(message, err);
    setIsError(true);
    setError(err);
  };

  /**
   * Private function to set the connection status
   * @constructor
   * @param {string} status - "connecting" | "connected" | "failed" | "disconnected"
   */
  const setCeramicConnection = useCallback(
    (status: "connecting" | "connected" | "failed" | "disconnected") => {
      setIsCeramicConnecting(false);
      setIsCeramicConnected(false);
      setIsCeramicFailed(false);
      setConnectionAddress(address);

      switch (status) {
        case "connected":
          setIsCeramicConnected(true);
          break;
        case "connecting":
          setIsCeramicConnecting(true);
          break;
        case "failed":
          setIsCeramicFailed(true);
          break;
        default:
          break;
      }
    },
    [address],
  );

  const disconnectDid3 = useCallback(() => {
    setDid3(undefined);
    setCeramicConnection("disconnected");
    setDid3Provider(undefined);
    setConnectionAddress(undefined);
    // Disconnect wallet
    disconnect();
    connectionAddress && localStorage.removeItem(connectionAddress);
    // The only way to disconnect the DID with 3id connect
    window.location.reload();
  }, [connectionAddress, setCeramicConnection, disconnect]);

  const connectDid3 = useCallback(async () => {
    if (ceramicClient && isConnected && connector && address) {
      const walletProvider = await connector.getProvider();
      setCeramicConnection("connecting");

      try {
        const { authProvider, did, didProvider } = await connect3ID(address as Address, walletProvider, ceramicClient);
        setDid3(did);
        setDid3Provider(didProvider);
        setCeramicConnection("connected");
        localStorage.setItem(address, "true");

       
        // console.log('streams', await loadMulti(ceramicClient, ['disco-sent']))

      } catch (error) {
        handleErr("Failed to connect to ceramic", error);
        setCeramicConnection("failed");
      }
    } else if (!isConnected) {
      throw "Wallet is not connected";
    }
  }, [connector, address, ceramicClient, setCeramicConnection, isConnected]);

  // Disconnect did3 if wallet address has changed
  useEffect(() => {
    if (connectionAddress) {
      if (address != connectionAddress) {
        disconnectDid3();
      }
    }
  }, [address, connectionAddress, disconnectDid3]);

  // autoReconnectDid3
  useEffect(() => {
    if (autoReconnectDid3 && address && !connectionAddress && localStorage.getItem(address)?.length) {
      connectDid3();
    }
  }, [autoReconnectDid3, address, connectionAddress, connectDid3]);

  // Manage modal

  const openConnectionModal = (onClose?: () => any) => {
    setIsConnectionModalOpen(true);
    if (typeof onClose === "function") {
      setConnectModalOnClose(() => () => onClose());
    }
  };

  const closeConnectionModal = useCallback(() => {
    connectModalOnClose();
    setConnectModalOnClose(() => () => null);
    setIsConnectionModalOpen(false);
  }, [connectModalOnClose]);

  // Disconnect wallet when modal is closed and ceramic not connected
  useEffect(() => {
    if (!isCeramicConnected && isConnected && autoReconnectDid3) {
      if (localStorage.getItem(address as string)?.length) {
        connectDid3();
      } else if (!isCeramicConnected && isConnected && !isConnectionModalOpen) {
        disconnect();
      }
    }
  }, [address, isCeramicConnected, isConnectionModalOpen, isConnected, autoReconnectDid3, disconnect, connectDid3]);

  const value = {
    autoReconnectDid3,
    autoConnectDid3,
    ceramicClient,
    isCeramicConnected,
    isCeramicConnecting,
    isCeramicFailed,
    did3,
    did3Provider,
    connectCeramic: connectDid3,
    disconnectCeramic: disconnectDid3,
    // useWallet,
    openConnectionModal,
    closeConnectionModal,
    isConnectionModalOpen,
    error,
    isError,
    streams: []
  };
  return (
    <Did3Context.Provider value={value} {...rest}>
      {children}
    </Did3Context.Provider>
  );
};

export const useDid3Context = () => {
  const context = useContext(Did3Context);
  return context;
};

import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ShareModal } from "../components/shareModal";
import { LoginModal } from "../components/loginModal";
import { MyProfileModal } from "../components/myProfileModal";
import { useAuth } from "./authProvider";

const modalNames = ["share", "login", "myprofile"] as const;
type ModalName = (typeof modalNames)[number];

type ModalContextInterface = {
  [Key in ModalName]: {
    isOpen: boolean;
    isOpening: boolean;
    isClosing: boolean;
    open: () => void;
    close: () => void;
  };
};

const base: ModalContextInterface = {
  share: {
    isOpen: false,
    isOpening: false,
    isClosing: false,
    open: async () => {
      throw new Error("Modal not ready");
    },
    close: async () => {
      throw new Error("Modal not ready");
    },
  },
  myprofile: {
    isOpen: false,
    isOpening: false,
    isClosing: false,
    open: async () => {
      throw new Error("Modal not ready");
    },
    close: async () => {
      throw new Error("Modal not ready");
    },
  },
  login: {
    isOpen: false,
    isOpening: false,
    isClosing: false,
    open: async () => {
      throw new Error("Modal not ready");
    },
    close: async () => {
      throw new Error("Modal not ready");
    },
  },
};

const modalContext = createContext<ModalContextInterface>(base);

export const ModalProvider: FC<PropsWithChildren> = ({ children, ...rest }) => {
  const { authenticated } = useAuth();
  const [state, setState] = useState({
    share: {
      isOpen: false,
      isOpening: false,
      isClosing: false,
    },
    login: {
      isOpen: false,
      isOpening: false,
      isClosing: false,
    },
    myprofile: {
      isOpen: false,
      isOpening: false,
      isClosing: false,
    },
  });

  const close = useCallback(
    (name: ModalName) => {
      setState({
        ...state,
        [name]: {
          isOpen: true,
          isOpening: false,
          isClosing: true,
        },
      });

      const _close = setTimeout(() => {
        setState({
          ...state,
          [name]: {
            isOpen: false,
            isOpening: false,
            isClosing: false,
          },
        });
      }, 500);

      // setOpen(true);
      return () => {
        clearTimeout(_close);
      };
    },
    [state],
  );

  const open = useCallback(
    (name: ModalName) => {
      setState({
        ...state,
        [name]: {
          isClosing: false,
          isOpen: false,
          isOpening: true,
        },
      });

      const _open = setTimeout(() => {
        setState({
          ...state,
          [name]: {
            isOpen: true,
            isOpening: false,
            isClosing: false,
          },
        });
      }, 100);

      // setOpen(true);
      return () => {
        clearTimeout(_open);
      };
    },
    [state],
  );

  const value = {
    login: {
      ...state.login,
      open: () => open("login"),
      close: () => close("login"),
    },
    share: {
      ...state.share,
      open: () => open("share"),
      close: () => close("share"),
    },
    myprofile: {
      ...state.myprofile,
      open: authenticated
        ? () => open("myprofile")
        : () => {
            throw new Error("Profile not authenticated");
          },
      close: () => close("myprofile"),
    },
  };

  return (
    <modalContext.Provider value={value} {...rest}>
      {children}
      <LoginModal />
      <ShareModal />
      <MyProfileModal />
    </modalContext.Provider>
  );
};

export const useShareModal = () => useContext(modalContext).share;
export const useLoginModal = () => useContext(modalContext).login;
export const useProfileModal = () => useContext(modalContext).myprofile;

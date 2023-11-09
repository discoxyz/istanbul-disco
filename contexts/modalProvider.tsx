import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useState,
} from "react";
import { ShareModal } from "../components/shareModal";

interface ModalContextInterface {
  isOpen: boolean;
  isOpening: boolean;
  isClosing: boolean;
  open: () => void;
  close: () => void;
}

const modalContext = createContext<ModalContextInterface>({
  isOpen: false,
  isOpening: false,
  isClosing: false,
  open: () => {
    throw new Error("Modal not ready");
  },
  close: () => {
    throw new Error("Modal not ready");
  },
});

export const ModalProvider: FC<PropsWithChildren> = ({ children, ...rest }) => {
  const [state, setState] = useState({
    isOpen: false,
    isOpening: false,
    isClosing: false,
  });

  const close = () => {
    setState({
      isOpen: true,
      isOpening: false,
      isClosing: true,
    });

    const _close = setTimeout(() => {
      setState({
        isOpen: false,
        isOpening: false,
        isClosing: false,
      });
    }, 500);

    // setOpen(true);
    return () => {
      clearTimeout(_close);
    };
  };

  const open = () => {
    setState({
      isClosing: false,
      isOpen: false,
      isOpening: true,
    });

    const _open = setTimeout(() => {
      setState({
        isOpen: true,
        isOpening: false,
        isClosing: false,
      });
    }, 100);

    // setOpen(true);
    return () => {
      clearTimeout(_open);
    };
  };

  const value = {
    ...state,
    open,
    close,
  };

  return (
    <modalContext.Provider value={value} {...rest}>
      {children}
      <ShareModal />
    </modalContext.Provider>
  );
};

export const useShareModal = () => useContext(modalContext);

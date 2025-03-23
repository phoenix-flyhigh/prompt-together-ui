import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type CollabContextType = {
  collabName: string;
  username: string;
  setCollabName: Dispatch<SetStateAction<string>>;
  setUsername: Dispatch<SetStateAction<string>>;
};

const CollabContext = createContext<CollabContextType>({} as CollabContextType);

export const CollabProvider = ({ children }: { children: ReactNode }) => {
  const [collabName, setCollabName] = useState("");
  const [username, setUsername] = useState("");

  const value: CollabContextType = {
    collabName,
    username,
    setCollabName,
    setUsername,
  };

  return (
    <CollabContext.Provider value={value}>{children}</CollabContext.Provider>
  );
};

export const useCollab: () => CollabContextType = () => {
  const value = useContext(CollabContext);

  return value;
};

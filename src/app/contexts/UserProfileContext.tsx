import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const NAME_KEY   = "memento_user_name";
const STATUS_KEY = "memento_user_status";

interface UserProfileValue {
  userName:   string;
  userStatus: string;
  saveProfile: (name: string, status: string) => void;
}

const UserProfileContext = createContext<UserProfileValue | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem(NAME_KEY) ?? "Alex";
  });

  const [userStatus, setUserStatus] = useState<string>(() => {
    return localStorage.getItem(STATUS_KEY) ?? "mindful";
  });

  useEffect(() => {
    localStorage.setItem(NAME_KEY, userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem(STATUS_KEY, userStatus);
  }, [userStatus]);

  function saveProfile(name: string, status: string) {
    setUserName(name);
    setUserStatus(status);
  }

  return (
    <UserProfileContext.Provider value={{ userName, userStatus, saveProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error("useUserProfile must be used within UserProfileProvider");
  return ctx;
}

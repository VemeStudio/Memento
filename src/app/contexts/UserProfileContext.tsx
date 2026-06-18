import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const NAME_KEY   = "memento_user_name";
const STATUS_KEY = "memento_user_status";
const CONFIDENCE_DAYS_KEY = "memento_confidence_days";
const LAST_SESSION_DATE_KEY = "memento_last_session_date";

interface UserProfileValue {
  userName:   string;
  userStatus: string;
  confidenceDays: number;
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

  const [confidenceDays, setConfidenceDays] = useState<number>(() => {
    const stored = localStorage.getItem(CONFIDENCE_DAYS_KEY);
    const parsed = stored ? Number.parseInt(stored, 10) : Number.NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  });

  useEffect(() => {
    localStorage.setItem(NAME_KEY, userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem(STATUS_KEY, userStatus);
  }, [userStatus]);

  useEffect(() => {
    try {
      const today = new Date().toDateString();
      const storedLastSession = localStorage.getItem(LAST_SESSION_DATE_KEY);

      if (!storedLastSession) {
        setConfidenceDays(1);
        localStorage.setItem(CONFIDENCE_DAYS_KEY, "1");
        localStorage.setItem(LAST_SESSION_DATE_KEY, today);
        return;
      }

      if (storedLastSession !== today) {
        setConfidenceDays((current) => {
          const nextDays = current + 1;
          localStorage.setItem(CONFIDENCE_DAYS_KEY, String(nextDays));
          localStorage.setItem(LAST_SESSION_DATE_KEY, today);
          return nextDays;
        });
        return;
      }

      localStorage.setItem(CONFIDENCE_DAYS_KEY, String(confidenceDays));
    } catch {
      /* ignore */
    }
  }, []);

  function saveProfile(name: string, status: string) {
    setUserName(name);
    setUserStatus(status);
  }

  return (
    <UserProfileContext.Provider value={{ userName, userStatus, confidenceDays, saveProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error("useUserProfile must be used within UserProfileProvider");
  return ctx;
}

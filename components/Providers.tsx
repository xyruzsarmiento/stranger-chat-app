"use client";

import { SessionProvider } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

interface AppContextType {
  onlineCount: number;
  activeChats: number;
}

const AppContext = createContext<AppContextType>({ onlineCount: 0, activeChats: 0 });
export const useApp = () => useContext(AppContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [onlineCount, setOnlineCount] = useState(8_241);
  const [activeChats, setActiveChats] = useState(3_108);

  useEffect(() => {
    // Simulate live counter updates
    const interval = setInterval(() => {
      setOnlineCount((prev) => prev + Math.floor(Math.random() * 10 - 4));
      setActiveChats((prev) => prev + Math.floor(Math.random() * 6 - 2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SessionProvider>
      <AppContext.Provider value={{ onlineCount, activeChats }}>
        {children}
      </AppContext.Provider>
    </SessionProvider>
  );
}

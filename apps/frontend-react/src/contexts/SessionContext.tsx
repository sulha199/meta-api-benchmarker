import React, { createContext, useContext, useState, useEffect } from "react";
import { appStorage } from "../utils/storage";
import { registerNodeJsVisitor, registerSupabaseVisitor } from "../utils/visitor";

interface SessionContextType {
  visitorId: string;
  isRegistered: boolean;
  isInitializing: boolean;
  registerVisitor: () => Promise<void>;
  resetSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitorId, setVisitorId] = useState<string>("");
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const storedRegStatus = await appStorage.get("meta_is_registered", false);
        setIsRegistered(storedRegStatus || false);

        let storedId = await appStorage.get("meta_visitor_id");
        if (!storedId) {
          storedId = crypto.randomUUID();
          await appStorage.set("meta_visitor_id", storedId);
        }
        setVisitorId(storedId);
      } catch (error) {
        console.error("Failed to initialize session data:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSession();
  }, []);

  const registerVisitor = async () => {
    if (isRegistered) return;

    try {
      console.log(`Registering universal Visitor ID: ${visitorId}...`);
      await Promise.all([
        registerNodeJsVisitor(visitorId),
        registerSupabaseVisitor(visitorId),
      ]);
      setIsRegistered(true);
      await appStorage.set("meta_is_registered", true);
      console.log("Successfully registered in both ecosystems!");
    } catch (error) {
      console.error("Failed to register visitor:", error);
      throw error;
    }
  };

  const resetSession = async () => {
    await appStorage.remove("meta_visitor_id");
    await appStorage.remove("meta_is_registered");
    await appStorage.remove("meta_topology_history");
    window.location.reload();
  };

  return (
    <SessionContext.Provider
      value={{
        visitorId,
        isRegistered,
        isInitializing,
        registerVisitor,
        resetSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

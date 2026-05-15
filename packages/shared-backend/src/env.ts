declare global {
  namespace NodeJS {
    interface ProcessEnv {
      POSTGRES_URL: string;
      MONGO_URI: string;
      NODE_ENV?: "development" | "production" | "test";
      PORT?: string;
    }
  }
}

// Export empty object to make this a module
export {};

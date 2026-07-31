import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      planTier: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    planTier: string;
  }
}

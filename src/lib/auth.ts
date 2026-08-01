import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkLoginLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

class TooManyAttemptsError extends CredentialsSignin {
  code = "too_many_attempts";
}

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials, request) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const ip = getClientIp(request);
        const { success } = await checkLoginLimit(ip);
        if (!success) throw new TooManyAttemptsError();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.banned || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        if (!user.emailVerified) throw new EmailNotVerifiedError();

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          planTier: user.planTier,
        };
      },
    }),
    ...(googleEnabled ? [Google] : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      const email = user.email;
      if (!email) return false;

      let dbUser = await prisma.user.findUnique({ where: { email } });
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: { email, name: user.name ?? null, emailVerified: new Date() },
        });
      }
      if (dbUser.banned) return false;

      user.id = dbUser.id;
      user.name = dbUser.name;
      user.role = dbUser.role;
      user.planTier = dbUser.planTier;
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
        token.planTier = user.planTier;
      }
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (dbUser) {
          token.name = dbUser.name;
          token.role = dbUser.role;
          token.planTier = dbUser.planTier;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string | undefined) ?? null;
        session.user.role = token.role as string;
        session.user.planTier = token.planTier as string;
      }
      return session;
    },
  },
});

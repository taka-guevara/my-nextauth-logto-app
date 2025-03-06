import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { OAuthConfig } from "next-auth/providers";
import { getUserInfoFromLogto } from "@/lib/logtoAuth";

const LogtoProvider = (): OAuthConfig<any> => ({
  id: "logto",
  name: "Logto",
  type: "oauth",
  wellKnown: "https://your-logto-endpoint/.well-known/openid-configuration",
  clientId: process.env.LOGTO_CLIENT_ID!,
  clientSecret: process.env.LOGTO_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: "openid profile email",
    },
  },
  idToken: true,
  checks: ["pkce", "state"],
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
    };
  },
});

const handler = NextAuth({
  providers: [
    // 1. Logto OAuth Provider (通常ログイン用)
    LogtoProvider(),

    // 2. Credentials Provider (外部サービスからの自動ログイン用)
    CredentialsProvider({
      name: "External Service",
      credentials: {
        token: { label: "Logto Token", type: "text" },
      },
      async authorize(credentials, req) {
        const token = credentials?.token;
        if (!token) return null;

        // Logto トークンを使ってユーザー情報を取得
        const user = await getUserInfoFromLogto(token);
        if (user) {
          return user;
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});

export { handler as GET, handler as POST };

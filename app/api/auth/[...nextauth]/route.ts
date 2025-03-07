import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { OAuthConfig } from "next-auth/providers";
import { jwtDecode } from "jwt-decode";

const LogtoProvider = (): OAuthConfig<any> => ({
  id: "logto",
  name: "Logto",
  type: "oauth",
  wellKnown: `${process.env.LOGTO_ENDPOINT}/oidc/.well-known/openid-configuration`,
  clientId: process.env.LOGTO_CLIENT_ID!,
  clientSecret: process.env.LOGTO_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: "openid profile email",
    },
  },
  client: {
    id_token_signed_response_alg: "ES384",
  },
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
    };
  },
});

interface DecodedToken {
  id: string;
  name: string;
  email: string;
}

const handler = NextAuth({
  providers: [
    // 1. Logto OAuth Provider (通常ログイン用)
    LogtoProvider(),

    // 2. Credentials Provider (外部サービスからの自動ログイン用)
    CredentialsProvider({
      name: "JWT",
      credentials: {
        token: { label: "JWT Token", type: "text" },
      },
      async authorize(credentials) {
        const token = credentials?.token;
        if (token) {
          // JWT をデコードして、ユーザー情報を取得
          const decoded = jwtDecode<DecodedToken>(token);
          return {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
          };
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
      session.user = session.user ?? {}; // user が存在しない場合、空オブジェクトを設定
      // session.user.id = token.id as string;
      session.user.name = token.name as string;
      session.user.email = token.email as string;
      return session;
    },

    async redirect({ url, baseUrl }) {
      // ログイン後にリダイレクトしたいページを指定
      return "/protected"; // 例: ログイン後に /protected ページに移動
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});

export { handler as GET, handler as POST };

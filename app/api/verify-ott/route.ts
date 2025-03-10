import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwtHandler";
import { getManagementApiToken, getPAT, getJWTFromPAT } from "@/lib/logtoAuth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ott = searchParams.get("ott");

  if (!ott) {
    return NextResponse.json({ error: "OTT is required" }, { status: 400 });
  }

  // 1. ワンタイムトークン (JWT) を検証して userId を取得
  const userId = await verifyJWT(ott);
  if (!userId) {
    return NextResponse.json(
      { error: "Invalid or expired OTT" },
      { status: 401 }
    );
  }

  // 2. Management API Token を取得
  const managementApiToken = await getManagementApiToken();
  if (!managementApiToken) {
    return NextResponse.json(
      { error: "Failed to get Management API Token" },
      { status: 500 }
    );
  }

  // 3. Logto から PAT を取得
  const pat = await getPAT(userId, managementApiToken);
  if (!pat) {
    return NextResponse.json(
      { error: "Failed to get PAT from Logto" },
      { status: 500 }
    );
  }

  // 4. PAT を使って JWT 形式のアクセストークンを取得
  const tokens = await getJWTFromPAT(pat);
  if (!tokens) {
    return NextResponse.json(
      { error: "Failed to get JWT from Logto" },
      { status: 500 }
    );
  }
  console.log("tokens", tokens);

  // 5. JWT を使って自動ログイン用の NextAuth.js クッキーを設定
  const response = NextResponse.redirect(
    `${process.env.NEXTAUTH_URL}/protected`
  );
  response.cookies.set("next-auth.session-token", tokens.accessToken, {
    httpOnly: true,
    secure: false,
  });
  if (tokens.refreshToken) {
    response.cookies.set("next-auth.refresh-token", tokens.refreshToken, {
      httpOnly: true,
      secure: false,
    });
  }

  return response;
}

import { NextResponse } from "next/server";
import { generateJWT } from "@/lib/jwtHandler";

export async function GET() {
  const userId = "dfkt66wvcm7t"; // 実際には認証済みユーザーIDを設定する
  const token = await generateJWT(userId);
  return NextResponse.json({ token });
}

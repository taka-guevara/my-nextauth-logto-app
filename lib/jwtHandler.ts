import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "default_secret_key";

// JWT 形式のワンタイムトークン (OTT) を生成する
export async function generateJWT(userId: string): Promise<string> {
  const token = jwt.sign({ userId }, SECRET_KEY, { expiresIn: "10m" }); // 10分間有効
  console.log("Generated JWT:", token);
  return token;
}

// JWT を検証して userId を取得する
export async function verifyJWT(token: string): Promise<string | null> {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
    console.log("Verified JWT:", decoded);
    return decoded.userId;
  } catch (error) {
    console.error("Invalid or expired JWT:", error);
    return null;
  }
}

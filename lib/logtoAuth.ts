const LOGTO_API_URL = process.env.LOGTO_ENDPOINT;

// 1. Logto から PAT (Personal Access Token) を取得する
export async function getPAT(userId: string): Promise<string | null> {
  try {
    const response = await fetch(`${LOGTO_API_URL}/pat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LOGTO_API_KEY}`,
      },
      body: JSON.stringify({
        userId,
        lifespan: 3600, // トークンの有効期限 (秒)
      }),
    });

    if (!response.ok) {
      console.error("Failed to get PAT from Logto:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Error fetching PAT from Logto:", error);
    return null;
  }
}

// 2. PAT を使って JWT 形式のアクセストークンを取得
export async function getJWTFromPAT(
  pat: string
): Promise<{ accessToken: string; refreshToken?: string } | null> {
  try {
    const response = await fetch(`${LOGTO_API_URL}/oidc/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.LOGTO_CLIENT_ID!,
        client_secret: process.env.LOGTO_CLIENT_SECRET!,
        scope: "openid profile email offline_access",
      }),
    });

    if (!response.ok) {
      console.error("Failed to get JWT from Logto:", response.statusText);
      return null;
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  } catch (error) {
    console.error("Error fetching JWT from Logto:", error);
    return null;
  }
}

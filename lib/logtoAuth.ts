const LOGTO_API_URL = process.env.LOGTO_ENDPOINT;

// 1. Management API Token を取得する関数
export async function getManagementApiToken(): Promise<string | null> {
  try {
    const response = await fetch(`${LOGTO_API_URL}/oidc/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.LOGTO_M2M_CLIENT_ID}:${process.env.LOGTO_M2M_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        resource: `${LOGTO_API_URL}/api`,
        scope: "all",
      }).toString(),
    });

    if (!response.ok) {
      console.error(
        "2Failed to get Management API Token from Logto:",
        response.statusText
      );
      console.error("Response Details:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching Management API Token from Logto:", error);
    return null;
  }
}

// 2. PAT (Personal Access Token) を取得する関数
export async function getPAT(
  userId: string,
  managementApiToken: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${LOGTO_API_URL}/api/users/${userId}/personal-access-tokens`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${managementApiToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to get PAT from Logto:", response.statusText);
      console.error("Response Details:", await response.text());
      return null;
    }

    const data = await response.json();
    console.log("data", data);
    return data[0].value; // PAT を返す
  } catch (error) {
    console.error("Error fetching PAT from Logto:", error);
    return null;
  }
}

// 3. PAT を使って JWT 形式のアクセストークンを取得する関数
export async function getJWTFromPAT(
  pat: string
): Promise<{ accessToken: string; refreshToken?: string } | null> {
  try {
    const response = await fetch(`${LOGTO_API_URL}/oidc/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.LOGTO_CLIENT_ID}:${process.env.LOGTO_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
        subject_token: pat,
        subject_token_type: "urn:logto:token-type:personal_access_token",
        scope: "openid profile email offline_access",
      }),
    });

    if (!response.ok) {
      console.error("Failed to get JWT from Logto:", response.statusText);
      console.error("Response Details:", await response.text());
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

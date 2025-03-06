// Logto のユーザー情報エンドポイントから情報を取得
export async function getUserInfoFromLogto(token: string) {
  try {
    const response = await fetch("https://your-logto-endpoint/userinfo", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user info from Logto");
    }

    const user = await response.json();
    return {
      id: user.sub,
      name: user.name,
      email: user.email,
    };
  } catch (error) {
    console.error("Logto ユーザー情報取得エラー:", error);
    return null;
  }
}

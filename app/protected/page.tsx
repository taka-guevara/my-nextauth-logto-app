"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ProtectedPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn(); // ログインページへリダイレクト
    }
  }, [status]);

  if (status === "loading") {
    return <p>読み込み中...</p>;
  }

  if (status === "authenticated") {
    return (
      <div>
        <h1>保護されたページ</h1>
        <p>ログイン中のみこのページを閲覧できます。</p>
        <p>こんにちは、{session.user?.name}さん！</p>
      </div>
    );
  }

  return null;
};

export default ProtectedPage;

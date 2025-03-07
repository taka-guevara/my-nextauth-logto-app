"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const AutoLoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  useEffect(() => {
    const token = searchParams.get("token");

    if (status === "unauthenticated" && token) {
      signIn("credentials", {
        token,
        redirect: false,
      }).then((result) => {
        if (result?.ok) {
          router.push("/protected");
        } else {
          router.push("/auth/error");
        }
      });
    }
  }, [status, searchParams, router]);

  return <p>自動ログイン中...</p>;
};

export default AutoLoginPage;

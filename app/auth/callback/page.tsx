"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const CallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      signIn("logto", {
        code,
        redirect: true,
        callbackUrl: "/",
      }).then(() => {
        router.push("/");
      });
    } else {
      router.push("/auth/error");
    }
  }, [searchParams, router]);

  return <p>認証を確認しています...</p>;
};

export default CallbackPage;

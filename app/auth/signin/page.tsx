"use client";

import { signIn } from "next-auth/react";

const SignInPage = () => {
  return (
    <div>
      <h1>Logto でログイン</h1>
      <button onClick={() => signIn("logto")}>Logto でログイン</button>
    </div>
  );
};

export default SignInPage;

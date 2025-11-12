"use client";

import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 bg-red-100" />
      <div className="flex-1 flex justify-center items-center bg-white">
        <RegisterForm />
      </div>
    </div>
  );
}

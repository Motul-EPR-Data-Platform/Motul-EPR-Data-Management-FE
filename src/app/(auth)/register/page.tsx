"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Button } from "@/components/ui/button";

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const [roleTitle, setRoleTitle] = useState("Đăng ký tài khoản");
  const [inviteInfo, setInviteInfo] = useState({
    targetRole: "" as
      | "motul_admin"
      | "motul_reviewer"
      | "recycler_admin"
      | "recycler"
      | "waste_transfer_admin"
      | "waste_transfer"
      | "",
    inviteToken: "",
    email: "",
  });

  useEffect(() => {
    const targetRole =
      (searchParams.get("target_role") as typeof inviteInfo.targetRole) || "";

    // handle both patterns:
    // ?token=<short_token> → backend token
    // #access_token=<long_token> → session token (email decode only)
    const urlToken = searchParams.get("token") || "";
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const access_token = hashParams.get("access_token") || "";

    // token for backend verification
    const inviteToken = urlToken || "";

    // decode email from access_token in url
    const email = access_token ? decodeEmail(access_token) : "";

    const titleMap: Record<string, string> = {
      motul_admin: "Đăng ký Quản trị viên Motul",
      motul_reviewer: "Đăng ký Kiểm duyệt viên Motul",
      recycler_admin: "Đăng ký Quản trị viên Đơn vị tái chế",
      recycler: "Đăng ký Nhân viên Đơn vị tái chế",
      waste_transfer_admin:
        "Đăng ký Quản trị viên Điểm trung chuyển chất thải",
      waste_transfer: "Đăng ký Nhân viên Điểm trung chuyển chất thải",
    };

    setRoleTitle(titleMap[targetRole] || "Đăng ký tài khoản");
    console.log('email and token', email, inviteToken)
    setInviteInfo({ targetRole, inviteToken, email });
  }, [searchParams]);

  function decodeEmail(token: string): string {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.email || payload.user_metadata?.email || "";
    } catch {
      return "";
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Left panel */}
      <div className="relative flex-1 flex flex-col justify-center px-6 py-10 text-white bg-[var(--motul-red)] md:px-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d61a10] to-[#800d07]" />

        <div className="relative z-10 max-w-md mx-auto text-center md:text-left">
          <Image
            src="/motul-logo.png"
            alt="Motul"
            width={120}
            height={40}
            className="mx-auto md:mx-0 mb-6 md:mb-8"
            priority
          />

          {/* Dynamic title per role */}
          <h1 className="text-3xl md:text-4xl font-bold leading-snug">
            {roleTitle.split(" ")[0]} <br />
            <span className="text-white/90">
              {roleTitle.replace(/^[^\s]+\s/, "")}
            </span>
          </h1>

          <p className="mt-4 text-white/80 text-sm md:text-base">
            Hoàn tất thông tin của bạn để kích hoạt tài khoản và bắt đầu quản lý
            kế hoạch EPR.
          </p>

          <p className="mt-4 text-white/80 text-xs md:text-sm font-medium">
            Vai trò hiện tại:
            <span className="ml-2 text-white font-semibold uppercase">
              {inviteInfo.targetRole || "Không xác định"}
            </span>
          </p>

          <div className="mt-3 flex flex-col sm:flex-row justify-center md:justify-start gap-3">
            <Button
              className="bg-white/10 hover:bg-white/30 text-white w-full sm:w-auto"
              asChild
            >
              <Link href="/docs">Hướng dẫn</Link>
            </Button>

            <Button
              className="bg-white/10 hover:bg-white/30 text-white w-full sm:w-auto"
              asChild
            >
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex justify-center items-center bg-gray-50 px-4 py-10 md:px-8 relative">
        <div className="w-full max-w-md">
          <RegisterForm
            title={roleTitle}
            email={inviteInfo.email}
            targetRole={inviteInfo.targetRole}
            inviteToken={inviteInfo.inviteToken}
          />
        </div>
      </div>
    </div>
  );
}

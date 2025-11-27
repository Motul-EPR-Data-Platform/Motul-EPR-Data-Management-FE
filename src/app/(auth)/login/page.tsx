"use client";

import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Left panel */}
      <div className="relative flex-1 flex flex-col justify-center px-6 py-10 text-white bg-[var(--motul-red)] md:px-12">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#d61a10] to-[#800d07]" />

        <div className="relative z-10 max-w-md mx-auto text-center md:text-left">
          {/* Motul logo */}
          <Image
            src="/motul-logo.png"
            alt="Motul"
            width={120}
            height={40}
            className="mx-auto md:mx-0 mb-6 md:mb-8"
            priority
          />

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-bold leading-snug">
            Đăng nhập để quản lý <br />
            <span className="text-white/90">kế hoạch và dữ liệu EPR</span>
          </h1>

          {/* Subtext */}
          <p className="mt-4 text-white/80 text-sm md:text-base">
            Truy cập bảng điều khiển, quản lý hồ sơ, và theo dõi quy trình tái chế của bạn một cách dễ dàng.
          </p>

          <p className="mt-4 text-white/80 text-xs md:text-sm font-medium">
            Bạn là?
          </p>

          {/* CTA buttons */}
          <div className="mt-3 flex flex-col sm:flex-row justify-center md:justify-start gap-3">
            <Button
              className="bg-white/10 hover:bg-white/30 text-white w-full sm:w-auto"
              asChild
            >
              <Link href="/docs">Nhà sản xuất</Link>
            </Button>

            <Button
              className="bg-white/10 hover:bg-white/30 text-white w-full sm:w-auto"
              asChild
            >
              <Link href="/status">Đơn vị tái chế</Link>
            </Button>

            <Button
              className="bg-white/10 hover:bg-white/30 text-white w-full sm:w-auto"
              asChild
            >
              <Link href="/status">Đại lý thu gom</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex justify-center items-center bg-gray-50 px-4 py-10 md:px-8 relative">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

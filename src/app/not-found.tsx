"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-[80vh] place-items-center px-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mx-auto mb-6 flex items-center justify-center">
          <Image
            src="/motul-logo.png"           // ensure this file exists in /public
            alt="MOTUL"
            width={140}
            height={40}
            priority
          />
        </div>

        {/* Tag + Title */}
        <span
          className="inline-block rounded-md px-3 py-1 text-xs font-medium tracking-wide"
          style={{ backgroundColor: "color-mix(in oklab, var(--motul-red) 12%, white)", color: "var(--motul-red)" }}
        >
          404 • Không tìm thấy trang
        </span>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Trang bạn tìm không tồn tại</h1>
        <p className="mt-2 text-muted-foreground">
          Liên kết có thể đã bị thay đổi hoặc xóa. Hãy quay lại bảng điều khiển.
        </p>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Link>
          </Button>

          <Button
            asChild
            className="border-0"
            style={{ backgroundColor: "var(--motul-red)" }}
          >
            <Link href="/motul">
              <Home className="mr-2 h-4 w-4" />
              Về Dashboard
            </Link>
          </Button>
        </div>

        {/* Subtle brand stripe */}
        <div
          className="mx-auto mt-8 h-0.5 w-36 rounded-full"
          style={{ backgroundColor: "var(--motul-red)" }}
        />
      </div>
    </main>
  );
}

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/motul/dashboard");
  };

  return (
    <Card className="w-[380px] shadow-md border-muted">
      <CardHeader>
        <h2 className="text-center text-2xl font-semibold">Đăng nhập</h2>
        <p className="text-center text-gray-500 text-sm">
          Điền thông tin của bạn để tiến hành đăng nhập
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Địa chỉ email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tên.email@têncty.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Mật khẩu</Label>
              <Link href="#" className="text-sm text-red-500 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" />
            <Label htmlFor="remember">Ghi nhớ tôi trong 30 ngày</Label>
          </div>
          <Button type="submit" className="w-full bg-red-500 hover:bg-red-600 cursor-pointer">
            Đăng nhập
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm">
        Chưa có tài khoản?  {""}
        <Link href="/register" className="text-red-500 font-medium hover:underline ms-1">
            Đăng ký tại đây
        </Link>
      </CardFooter>
    </Card>
  );
}

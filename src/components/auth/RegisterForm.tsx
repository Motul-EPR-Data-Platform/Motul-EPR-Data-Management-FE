"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

export function RegisterForm() {
  return (
    <Card className="w-[380px] shadow-md">
      <CardHeader>
        <h2 className="text-center text-2xl font-semibold">Đăng ký</h2>
        <p className="text-center text-gray-500 text-sm">Tạo tài khoản mới để bắt đầu</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <Label htmlFor="name">Họ và tên</Label>
            <Input id="name" placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="tên.email@têncty.com" />
          </div>
          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full bg-red-500 hover:bg-red-600">
            Đăng ký
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-red-500 font-medium hover:underline">
          Đăng nhập
        </Link>
      </CardFooter>
    </Card>
  );
}

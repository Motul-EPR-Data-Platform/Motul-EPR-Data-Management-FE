"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getAuthErrorMessage } from "@/lib/utils/errorHandler";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Login using context (which will update user state)
      await login(data.email, data.password);

      // Show success toast
      toast.success("Đăng nhập thành công!");

      // Reset loading state before redirect to prevent UI freeze
      setIsLoading(false);

      // Wait a bit for context to update, then redirect
      // The redirect will be handled by checking the user's organization
      const redirectTo = searchParams.get("redirect");
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        // Default redirect - will be handled by RouteGuard or redirect to user's org
        router.push("/motul");
      }
      router.refresh();
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      setIsLoading(false);
    }
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
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Địa chỉ email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tên.email@têncty.com"
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
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
              {...register("password")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              {...register("remember")}
              disabled={isLoading}
            />
            <Label htmlFor="remember">Ghi nhớ tôi trong 30 ngày</Label>
          </div>
          <Button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm">
        Chưa có tài khoản? {""}
        <Link
          href="/register"
          className="text-red-500 font-medium hover:underline ms-1"
        >
          Đăng ký tại đây
        </Link>
      </CardFooter>
    </Card>
  );
}

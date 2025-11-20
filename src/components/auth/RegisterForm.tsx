// components/auth/RegisterForm.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthService } from "@/lib/services/auth.service";
import {
  registerInviteSchema,
  type RegisterInviteFormData,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";

type Props = {
  title: string;
  email: string;
  targetRole:
    | "motul_admin"
    | "motul_reviewer"
    | "recycler_admin"
    | "recycler"
    | "waste_transfer_admin"
    | "waste_transfer"
    | "";
  accessToken: string; // access_token from URL hash
};

export function RegisterForm({ title, email, targetRole, accessToken }: Props) {
  const router = useRouter();

  const form = useForm<RegisterInviteFormData>({
    resolver: zodResolver(registerInviteSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      accessToken: "", // This will hold the accessToken
      targetRole: "" as RegisterInviteFormData["targetRole"],
    },
  });

  const { register, handleSubmit, setValue, formState } = form;
  const { errors, isSubmitting } = formState;

  useEffect(() => {
    console.log("Current values:", form.watch());
    console.log("Current errors:", errors);
  }, [form.watch(), errors]);

  // Correct way: push props into RHF state when they arrive
  useEffect(() => {
    if (email)
      setValue("email", email, { shouldDirty: false, shouldValidate: false });
  }, [email, setValue]);

  useEffect(() => {
    // Pass access_token as accessToken to the form
    // The backend expects this token for verification
    if (accessToken)
      setValue("accessToken", accessToken, {
        shouldDirty: false,
        shouldValidate: false,
      });
  }, [accessToken, setValue]);

  useEffect(() => {
    if (targetRole)
      setValue(
        "targetRole",
        targetRole as RegisterInviteFormData["targetRole"],
        { shouldDirty: false, shouldValidate: false },
      );
  }, [targetRole, setValue]);

  const onSubmit: SubmitHandler<RegisterInviteFormData> = async (values) => {
    console.log("values", values);
    try {
      await toast.promise(registerByRole(values), {
        loading: "Đang tạo tài khoản...",
        success: "Đăng ký thành công! Vui lòng đăng nhập.",
        error: (err) =>
          err?.response?.data?.message ||
          err?.message ||
          "Đăng ký thất bại. Vui lòng thử lại.",
      });
      router.push("/login");
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  function registerByRole(values: RegisterInviteFormData) {
    // The access_token will be sent in the Authorization header as Bearer token
    // Backend extracts it from: req.headers.authorization
    const dto = {
      email: values.email,
      password: values.password,
      fullName: values.fullName,
      accessToken: values.accessToken, // This is the access_token from URL - sent as Bearer token
    };

    switch (values.targetRole) {
      case "recycler_admin":
        return AuthService.registerRecyclerAdmin(dto);
      case "recycler":
        return AuthService.registerRecycler(dto);
      case "waste_transfer_admin":
        return AuthService.registerWasteTransferAdmin(dto);
      case "waste_transfer":
        return AuthService.registerWasteTransfer(dto);
      case "motul_admin":
      case "motul_reviewer":
        return AuthService.registerMotul({
          email: dto.email,
          password: dto.password,
          fullName: dto.fullName,
          role: values.targetRole,
          accessToken: dto.accessToken,
        });
      default:
        throw new Error(`Unsupported role: ${values.targetRole}`);
    }
  }

  return (
    <Card className="w-[380px] shadow-md">
      <CardHeader>
        <h2 className="text-center text-2xl font-semibold">{title}</h2>
        <p className="text-center text-gray-500 text-sm">
          Vui lòng hoàn tất đăng ký để bắt đầu sử dụng hệ thống.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input
              id="fullName"
              placeholder="Nguyễn Văn A"
              {...register("fullName")}
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              readOnly // <-- readOnly so it still submits value
              className="bg-gray-100"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Keep hidden fields to ensure payload integrity */}
          <input type="hidden" {...register("accessToken")} />
          <input type="hidden" {...register("targetRole")} />

          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="text-center text-sm">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="text-red-500 font-medium hover:underline"
        >
          Đăng nhập
        </Link>
      </CardFooter>
    </Card>
  );
}

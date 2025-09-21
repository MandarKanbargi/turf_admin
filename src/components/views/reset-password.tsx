import { z } from "zod";
import { resetPassSchema, indianIntlPhoneSchema } from "@/utils/form-schemas";
import { useLocation, Navigate, useNavigate } from "react-router";
import {
  useForm,
  type SubmitHandler,
  type SubmitErrorHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, Fragment } from "react";
import { authClient } from "@/utils/auth-client";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/elements/button";
import { Icons } from "@/components/icons";
import { Input } from "@/components/elements/input";

type ResetPass = z.infer<typeof resetPassSchema>;

export const ResetPassword = () => {
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber;

  if (!phoneNumber || !indianIntlPhoneSchema.safeParse(phoneNumber).success) {
    return <Navigate to="/auth/forgot-password" />;
  }

  const navigate = useNavigate();

  const form = useForm<ResetPass>({
    resolver: zodResolver(resetPassSchema),
    defaultValues: {
      otp: "",
      newPass: "",
    },
  });

  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const togglePassVisibility = () => {
    setShowPass(!showPass);
  };

  const onValid: SubmitHandler<ResetPass> = async (data) => {
    const { otp, newPass } = data;
    setIsLoading(true);

    try {
      await authClient.phoneNumber.resetPassword(
        {
          phoneNumber,
          newPassword: newPass,
          otp,
        },
        {
          onSuccess: () => {
            toast.success("Password updated successfully. You can now log in.");
            navigate("/auth/login");
            form.reset();
          },
          onError: (ctx) => {
            toast.message("Oops!", {
              description:
                ctx.error?.message ??
                "An error occurred. Please try again later.",
            });
          },
        },
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onInvalid: SubmitErrorHandler<ResetPass> = (errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) toast.error(firstError.message);
  };

  return (
    <Fragment>
      <AppHeader
        startAdornment={
          <Button
            size="icon"
            variant="icon-outline"
            className="shadow-none"
            onClick={() => navigate(-1)}
            children={<Icons.arrowLeft className="size-5" />}
          />
        }
      />

      <section className="grid gap-6 px-5 py-20">
        <div className="grid gap-2">
          <h4 className="text-h4 text-text-100 font-generalsans font-semibold">
            Reset your password
          </h4>

          <p className="text-body text-text-200 font-normal">
            Choose a new password for your account.
          </p>
        </div>

        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit(onValid, onInvalid)}
        >
          <div className="shadow-down rounded-xl">
            <Input
              type="number"
              label="Enter Reset Code"
              {...form.register("otp")}
            />

            <Input
              type={showPass ? "text" : "password"}
              label="New Password"
              {...form.register("newPass")}
              endAdornment={
                showPass ? (
                  <Icons.eyeOff
                    className="size-4"
                    onClick={togglePassVisibility}
                  />
                ) : (
                  <Icons.eye
                    className="size-4"
                    onClick={togglePassVisibility}
                  />
                )
              }
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Please wait..." : "Save Password"}
          </Button>
        </form>
      </section>
    </Fragment>
  );
};

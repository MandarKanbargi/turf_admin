import { z } from "zod";
import { verifyPhoneSchema, indianIntlPhoneSchema } from "@/utils/form-schemas";
import { maskIndianNumber } from "@/utils/helpers";
import { useLocation, Navigate, useNavigate } from "react-router";
import { useCountdown } from "@/hooks/use-countdown";
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
import { Input } from "@/components/elements/input";
import { Button } from "@/components/elements/button";

type VerifyPhone = z.infer<typeof verifyPhoneSchema>;

export const VerifyOtp = () => {
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber;

  if (!phoneNumber || !indianIntlPhoneSchema.safeParse(phoneNumber).success) {
    return <Navigate to="/auth/enter-phone-number" />;
  }

  const navigate = useNavigate();

  const { formattedTime, isActive, start } = useCountdown({ seconds: 30 });

  const form = useForm<VerifyPhone>({
    resolver: zodResolver(verifyPhoneSchema),
    defaultValues: {
      otp: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isResendingOTP, setIsResendingOTP] = useState(false);

  const handleResendOTP = async () => {
    setIsResendingOTP(true);

    try {
      await authClient.phoneNumber.sendOtp(
        { phoneNumber },
        {
          onSuccess: (ctx) => {
            toast.success(ctx.data.message);
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
      start();
      setIsResendingOTP(false);
    }
  };

  const onValid: SubmitHandler<VerifyPhone> = async (data) => {
    setIsLoading(true);

    try {
      await authClient.phoneNumber.verify(
        { phoneNumber, code: data.otp },
        {
          onSuccess: () => {
            toast.success("Phone number verified successfully.");
            navigate("/auth/complete-signup");
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

  const onInvalid: SubmitErrorHandler<VerifyPhone> = (errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) toast.error(firstError.message);
  };

  return (
    <Fragment>
      <AppHeader />

      <section className="grid gap-6 px-5 py-20">
        <div className="grid gap-2">
          <h4 className="text-h4 text-text-100 font-generalsans font-semibold">
            Verify your phone number
          </h4>

          <p className="text-body text-text-200 font-normal">
            Enter the code sent to {maskIndianNumber(phoneNumber)}
          </p>
        </div>

        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit(onValid, onInvalid)}
        >
          <div className="shadow-down rounded-xl">
            <Input
              type="number"
              label="One-Time Password"
              {...form.register("otp")}
            />
          </div>

          <button
            type="button"
            onClick={handleResendOTP}
            disabled={isActive || isResendingOTP}
            className="text-label text-text-100 disabled:text-text-200 w-fit font-medium underline underline-offset-2"
          >
            {isActive
              ? `Didn't receive it? Resend in ${formattedTime}`
              : "Resend Code"}
          </button>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Please wait..." : "Verify & Continue"}
          </Button>
        </form>
      </section>
    </Fragment>
  );
};

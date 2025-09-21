import { z } from "zod";
import { enterPhoneSchema } from "@/utils/form-schemas";
import { useNavigate } from "react-router";
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
import { Link } from "react-router";

type EnterPhone = z.infer<typeof enterPhoneSchema>;

export const EnterPhoneNumber = () => {
  const navigate = useNavigate();

  const form = useForm<EnterPhone>({
    resolver: zodResolver(enterPhoneSchema),
    defaultValues: {
      countryCode: "+91",
      phoneNumber: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onValid: SubmitHandler<EnterPhone> = async (data) => {
    const { countryCode, phoneNumber } = data;
    setIsLoading(true);

    try {
      await authClient.phoneNumber.sendOtp(
        {
          phoneNumber: countryCode + phoneNumber,
        },
        {
          onSuccess: () => {
            toast.success("OTP sent successfully. Please check your phone.");

            navigate("/auth/verify-otp", {
              state: { phoneNumber: countryCode + phoneNumber },
            });

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

  const onInvalid: SubmitErrorHandler<EnterPhone> = (errors) => {
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
            Enter your phone number
          </h4>

          <p className="text-body text-text-200 font-normal">
            We’ll send you a one-time code to verify your number.
          </p>
        </div>

        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit(onValid, onInvalid)}
        >
          <div className="shadow-down rounded-xl">
            <Input
              readOnly
              type="text"
              value="+91 (India)"
              label="Country Code"
              endAdornment={<Icons.chevronDown className="size-4" />}
            />

            <Input
              type="tel"
              label="Mobile Number"
              {...form.register("phoneNumber")}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Please wait..." : "Send OTP"}
          </Button>
        </form>

        <p className="text-body text-text-100 font-normal">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary-200 font-medium">
            Log In
          </Link>
        </p>
      </section>
    </Fragment>
  );
};

import { z } from "zod";
import { loginSchema } from "@/utils/form-schemas";
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

type Login = z.infer<typeof loginSchema>;

export const Login = () => {
  const navigate = useNavigate();

  const form = useForm<Login>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      countryCode: "+91",
      phoneNumber: "",
      password: "",
    },
  });

  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const togglePassVisibility = () => {
    setShowPass(!showPass);
  };

  const onValid: SubmitHandler<Login> = async (data) => {
    const { countryCode, phoneNumber, password } = data;
    setIsLoading(true);

    try {
      await authClient.signIn.phoneNumber(
        { phoneNumber: countryCode + phoneNumber, password },
        {
          onSuccess: () => {
            toast.success("Logged in successfully.");
            navigate("/");
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

  const onInvalid: SubmitErrorHandler<Login> = (errors) => {
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
            Welcome back!
          </h4>

          <p className="text-body text-text-200 font-normal">
            Log in to continue booking or managing your turf.
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

            <Input
              type={showPass ? "text" : "password"}
              label="Password"
              {...form.register("password")}
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

          <Link
            to="/auth/forgot-password"
            className="text-label text-text-100 w-fit font-medium underline underline-offset-2"
          >
            Forgot Password?
          </Link>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Please wait..." : "Log In"}
          </Button>
        </form>

        <p className="text-body text-text-100 font-normal">
          Don't have an account?{" "}
          <Link
            to="/auth/enter-phone-number"
            className="text-primary-200 font-medium"
          >
            Register now
          </Link>
          !
        </p>
      </section>
    </Fragment>
  );
};

import { z } from "zod";
import { signUpSchema } from "@/utils/form-schemas";
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
import { Input } from "@/components/elements/input";
import { Icons } from "@/components/icons";
import { Button } from "@/components/elements/button";

type SignUp = z.infer<typeof signUpSchema>;

export const CompleteSignup = () => {
  const navigate = useNavigate();

  const form = useForm<SignUp>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const togglePassVisibility = () => {
    setShowPass(!showPass);
  };

  const onValid: SubmitHandler<SignUp> = async (data) => {
    setIsLoading(true);

    try {
      await authClient.updateProfile(
        { ...data, name: data.fullName },
        {
          onSuccess: () => {
            toast.success("Account created successfully. Welcome aboard!");
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

  const onInvalid: SubmitErrorHandler<SignUp> = (errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) toast.error(firstError.message);
  };

  return (
    <Fragment>
      <AppHeader />

      <section className="grid gap-6 px-5 py-20">
        <div className="grid gap-2">
          <h4 className="text-h4 text-text-100 font-generalsans font-semibold">
            Almost done!
          </h4>

          <p className="text-body text-text-200 font-normal">
            Tell us a bit about you to get started.
          </p>
        </div>

        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit(onValid, onInvalid)}
        >
          <div className="shadow-down rounded-xl">
            <Input
              type="text"
              label="Full Name"
              {...form.register("fullName")}
            />

            <Input
              type="email"
              label="Email Address"
              {...form.register("email")}
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

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Please wait..." : "Finish Sign Up"}
          </Button>
        </form>
      </section>
    </Fragment>
  );
};

import { forwardRef, useId, Fragment } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends React.ComponentProps<"input"> {
  label: string;
  endAdornment?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, endAdornment = <Fragment />, ...props }, ref) => {
    const internalId = useId();

    return (
      <div
        role="textbox"
        className="border-background-300 focus-within:border-primary-200 group bg-background-100 relative grid h-14 w-full place-items-center gap-1 border-x border-b px-3 py-2 transition-all duration-200 ease-in-out first:rounded-t-xl first:border-t last:rounded-b-xl focus-within:z-10 focus-within:border"
      >
        <div className="z-50 order-2 flex w-full items-center justify-between">
          <input
            ref={ref}
            {...props}
            id={internalId}
            placeholder=" "
            data-slot="input"
            className={cn(
              "peer text-label! text-text-100 grow font-medium placeholder-transparent outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
          />

          <span className="text-text-100 hidden shrink-0 peer-focus:block peer-[:not(:placeholder-shown)]:block">
            {endAdornment}
          </span>
        </div>

        <label
          htmlFor={internalId}
          className="text-text-200 text-label! group-focus-within:text-body-xs! group-has-[input:not(:placeholder-shown)]:text-body-xs! absolute inset-0 left-3 order-1 flex w-full items-center font-medium transition-all duration-200 ease-in-out group-focus-within:static group-focus-within:font-normal group-has-[input:not(:placeholder-shown)]:static group-has-[input:not(:placeholder-shown)]:font-normal"
        >
          {label}
        </label>
      </div>
    );
  },
);

Input.displayName = "Input";

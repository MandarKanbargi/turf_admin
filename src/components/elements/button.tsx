import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "text-label! shadow-down inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ease-in-out outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-background-100 bg-primary-200 hover:bg-primary-100",
        outline:
          "text-primary-200 border-primary-200 hover:text-background-100 hover:bg-primary-200 border bg-transparent hover:border-none",
        "icon-outline":
          "text-text-100 border-background-300 hover:bg-background-200 border bg-transparent",
      },
      size: {
        default: "px-3 py-3",
        sm: "px-3 py-2",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export const Button = ({
  asChild = false,
  variant,
  size,
  className,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      data-slot="button"
      {...props}
    />
  );
};

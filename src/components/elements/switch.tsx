import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/utils/cn";

const Switch = ({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) => {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "data-[state=checked]:bg-primary-200 data-[state=unchecked]:bg-background-300 relative h-6 w-11 shrink-0 rounded-full transition-all duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background-100 pointer-events-none absolute top-2/4 block size-5 -translate-y-2/4 rounded-full transition-all duration-300 ease-in-out data-[state=checked]:left-5.5 data-[state=unchecked]:left-0.5",
        )}
      />
    </SwitchPrimitive.Root>
  );
};

export { Switch };

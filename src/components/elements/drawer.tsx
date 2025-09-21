import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/utils/cn";

const Drawer = ({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
};

const DrawerTrigger = ({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) => {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
};

const DrawerPortal = ({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) => {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
};

const DrawerClose = ({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) => {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
};

const DrawerOverlay = ({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) => {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50",
        "bg-background-300/20 backdrop-blur-xs",
        className,
      )}
      {...props}
    />
  );
};

const DrawerContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) => {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "bg-background-100 shadow-up font-firasans text-text-100 fixed z-50 flex h-auto w-full flex-col antialiased transition-all duration-500 ease-in-out",
          "data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:rounded-b-xl",
          "data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:rounded-t-xl",
          "data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:rounded-l-xl",
          "data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:rounded-r-xl",
          className,
        )}
        {...props}
      >
        <div className="bg-background-300 mx-auto mt-1.5 h-1.5 w-16 shrink-0 rounded-full" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
};

const DrawerHeader = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-2 px-5 py-4 text-center", className)}
      {...props}
    />
  );
};

const DrawerFooter = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        "shadow-up bg-background-100 border-background-300 h-18 w-full border-t px-5 py-4 antialiased",
        className,
      )}
      {...props}
    />
  );
};

const DrawerTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) => {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-h6! font-generalsans", className)}
      {...props}
    />
  );
};

const DrawerDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) => {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-body! text-text-200", className)}
      {...props}
    />
  );
};

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};

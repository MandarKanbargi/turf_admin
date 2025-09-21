import { Toaster as Sonner, type ToasterProps } from "sonner";

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      style={
        {
          "--normal-bg": "var(--color-background-100)",
          "--normal-text": "var(--color-text-100)",
          "--normal-border": "var(--color-background-300)",
        } as React.CSSProperties
      }
      className="toaster group"
      {...props}
    />
  );
};

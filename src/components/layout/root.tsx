import { Outlet } from "react-router";
import { Toaster } from "@/components/elements/sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const Root = () => {
  return (
    <main className="text-text-100 font-firasans bg-background-200 relative flex min-h-screen w-screen flex-col antialiased">
      <Outlet />
      <Toaster position="top-center" />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </main>
  );
};

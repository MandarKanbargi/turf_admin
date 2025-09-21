import React from "react";
import { createBrowserRouter, redirect } from "react-router";
import { Root } from "@/components/layout/root";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Login } from "@/components/views";
import { authClient } from "@/utils/auth-client";

const EnterPhoneNumber = React.lazy(() =>
  import("@/components/views").then((module) => ({
    default: module.EnterPhoneNumber,
  })),
);

const VerifyOtp = React.lazy(() =>
  import("@/components/views").then((module) => ({
    default: module.VerifyOtp,
  })),
);

const CompleteSignup = React.lazy(() =>
  import("@/components/views").then((module) => ({
    default: module.CompleteSignup,
  })),
);

const ForgotPassword = React.lazy(() =>
  import("@/components/views").then((module) => ({
    default: module.ForgotPassword,
  })),
);

const ResetPassword = React.lazy(() =>
  import("@/components/views").then((module) => ({
    default: module.ResetPassword,
  })),
);

const TurfsManagement = React.lazy(() =>
  import("./components/pages/turfs-management").then((module) => ({
    default: module.TurfsManagement,
  })),
);

const BookingsManagement = React.lazy(
  () => import("./components/pages/bookings-management")
);

const EditTurf = React.lazy(() =>
  import("./components/pages/edit-turf").then((module) => ({
    default: module.EditTurf, 
  })),
);
const SlotSelection = React.lazy(() =>
  import("./components/pages/slot-selection").then((module) => ({
    default: module.SlotSelection,
  })),
);
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        loader: async () => {
          const { data } = await authClient.getSession();
          if (data?.session) {
            return redirect("/dashboard/turfs");
          }
          return redirect("/auth/login");
        },
      },
      {
        path: "auth",
        children: [
          {
            path: "enter-phone-number",
            Component: EnterPhoneNumber,
          },
          {
            path: "verify-otp",
            Component: VerifyOtp,
          },
          {
            path: "complete-signup",
            Component: CompleteSignup,
            loader: async () => {
              const { data } = await authClient.getSession();
              if (!data?.session) return redirect("/auth/enter-phone-number");
            },
          },
          {
            path: "login",
            Component: Login,
            loader: async () => {
              const { data } = await authClient.getSession();
              if (data?.session) return redirect("/auth/login");
            },
          },
          {
            path: "forgot-password",
            Component: ForgotPassword,
          },
          {
            path: "reset-password",
            Component: ResetPassword,
          },
        ],
      },
      {
    path: "dashboard",
    Component: DashboardLayout,
    loader: async () => {
      const { data } = await authClient.getSession();
      if (!data?.session) return redirect("/auth/login");
      return { user: data?.user };
    },
  children: [
    {
      index: true,
      loader: () => redirect("/dashboard/turfs"),
    },
    {
      path: "turfs",
      Component: TurfsManagement,
    },
    {
      path: "turfs/:turfId/bookings",
      Component: BookingsManagement,
    },
    {
      path: "turfs/:turfId/edit",
      Component: EditTurf,
    },
    {
      path: "turfs/:turfId/slots",
      Component: SlotSelection,
    },

  ],
},

      
    ],
  },
]);

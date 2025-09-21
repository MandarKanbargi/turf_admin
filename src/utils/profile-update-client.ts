import type { BetterAuthClientPlugin } from "better-auth/client";
import type { BetterFetchOption } from "@better-fetch/fetch";
import type { profileUpdate } from "./profile-update-plugin";

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  password?: string;
}

export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    updatedAt: Date;
  };
}

export const profileUpdateClient = () => {
  return {
    id: "profile-update",
    $InferServerPlugin: {} as ReturnType<typeof profileUpdate>,
    pathMethods: {
      "/profile/update": "POST",
    },
    getActions: ($fetch) => {
      return {
        updateProfile: async (
          data: ProfileUpdateData,
          fetchOptions?: BetterFetchOption,
        ) => {
          const res = await $fetch<ProfileUpdateResponse>("/profile/update", {
            method: "POST",
            body: data,
            ...fetchOptions,
          });
          return res;
        },
      };
    },
  } satisfies BetterAuthClientPlugin;
};

import { createAuthClient } from "better-auth/react";
import { phoneNumberClient, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:import.meta.env.VITE_BASE_API_URL,
  plugins: [phoneNumberClient(), adminClient()],
});


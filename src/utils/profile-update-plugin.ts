import {
  createAuthEndpoint,
  sessionMiddleware,
  APIError,
} from "better-auth/api";
import type { BetterAuthPlugin } from "better-auth";

export const profileUpdate = () => {
  return {
    id: "profile-update",
    endpoints: {
      setProfile: createAuthEndpoint(
        "/profile/update",
        {
          method: "POST",
          use: [sessionMiddleware],
        },
        async (ctx) => {
          try {
            // Extract data from request body
            const { name, email, password } = ctx.body;

            // Validate required fields
            if (!name && !email && !password) {
              throw new APIError("BAD_REQUEST", {
                message:
                  "At least one field (name, email, or password) must be provided",
              });
            }

            // Get session from context (sessionMiddleware provides this)
            const session = ctx.context.session;
            if (!session?.user?.id) {
              throw new APIError("UNAUTHORIZED", {
                message: "Valid session required",
              });
            }

            const userId = session.user.id;

            // Use Internal Adapter to find the user
            const existingUser =
              await ctx.context.internalAdapter.findUserById(userId);
            if (!existingUser) {
              throw new APIError("NOT_FOUND", {
                message: "User not found",
              });
            }

            // Check if email is already taken by another user (if email is being updated)
            if (email && email !== existingUser.email) {
              const emailExists =
                await ctx.context.internalAdapter.findUserByEmail(email);
              if (emailExists) {
                throw new APIError("CONFLICT", {
                  message: "Email already exists",
                });
              }
            }

            // Prepare update data for user profile
            const updateData: Partial<{
              name: string;
              email: string;
            }> = {};

            if (name) {
              updateData.name = name;
            }

            if (email) {
              updateData.email = email;
            }

            // Update user profile data using Internal Adapter
            let updatedUser = existingUser;
            if (Object.keys(updateData).length > 0) {
              updatedUser = await ctx.context.internalAdapter.updateUser(
                userId,
                updateData
              );
            }

            // Handle password update using Internal Adapter
            if (password) {
              // Hash the password using BetterAuth's password utility
              const hashedPassword = await ctx.context.password.hash(password);

              // Update the user's password using Internal Adapter
              // This will handle the accounts table properly
              await ctx.context.internalAdapter.updatePassword(
                userId,
                hashedPassword
              );
            }

            return ctx.json({
              success: true,
              message: "Profile updated successfully",
              user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                updatedAt: updatedUser.updatedAt,
              },
            });
          } catch (error) {
            // Re-throw APIErrors as they are
            if (error instanceof APIError) {
              throw error;
            }

            // Handle other errors
            console.error("Profile update error:", error);
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "An unexpected error occurred",
            });
          }
        }
      ),
    },
  } satisfies BetterAuthPlugin;
};

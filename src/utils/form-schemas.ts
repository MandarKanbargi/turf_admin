import { z } from "zod";

export const phoneSchema = z
  .string()
  .length(10, "Mobile number must be exactly 10 digits")
  .regex(/^[0-9]+$/, "Mobile number must contain only digits");

export const enterPhoneSchema = z.object({
  countryCode: z.string().min(1, "Country code is required"),
  phoneNumber: phoneSchema,
});

export const verifyPhoneSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^[0-9]+$/, "OTP must contain only digits"),
});

export const signUpSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  countryCode: z.string().min(1, "Country code is required"),
  phoneNumber: phoneSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgotPassSchema = enterPhoneSchema;

export const resetPassSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^[0-9]+$/, "OTP must contain only digits"),
  newPass: z.string().min(6, "New password must be at least 6 characters"),
});

export const indianIntlPhoneSchema = z
  .string()
  .regex(
    /^\+91[-\s]?[6-9]\d{9}$/,
    "Invalid format. Use +91 followed by 10-digit mobile number",
  );

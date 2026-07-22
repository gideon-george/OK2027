import { z } from "zod";

/** Nigerian mobile numbers, accepted as 0803… or +234803… */
export const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^(\+?234|0)[789]\d{9}$/,
    "Enter a valid Nigerian phone number, e.g. 08031234567"
  );

export const fullNameSchema = z
  .string()
  .trim()
  .min(3, "Enter your full name")
  .max(120, "That name is too long");

/**
 * Member registration.
 *
 * Deliberately absent: PVC number and VIN. The movement records only whether a
 * member holds a PVC, never the number itself — see docs/nokm-framework.md §7.
 */
export const joinSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
  stateCode: z.string().min(1, "Select your state"),
  lgaCode: z.string().optional(),
  wardCode: z.string().optional(),
  pvcStatus: z.enum(["yes", "no", "in_progress"], {
    message: "Tell us where you are with your PVC",
  }),
  referredBy: z.string().trim().max(40).optional(),
  consent: z.literal(true, {
    message: "You must agree before we can register you",
  }),
});

export type JoinInput = z.infer<typeof joinSchema>;

export const contactOfficeSchema = z.object({
  fromName: fullNameSchema,
  fromContact: z
    .string()
    .trim()
    .min(5, "Give a phone number or email so the office can reply")
    .max(120),
  subject: z.string().trim().min(3, "Add a subject").max(140),
  message: z
    .string()
    .trim()
    .min(20, "Please give the office enough detail to act on")
    .max(2000, "Keep it under 2000 characters"),
});

export type ContactOfficeInput = z.infer<typeof contactOfficeSchema>;

export const applicationSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
  statement: z
    .string()
    .trim()
    .min(50, "Tell the vetting panel why you should hold this post")
    .max(2500, "Keep it under 2500 characters"),
  consent: z.literal(true, {
    message: "You must agree before we can process your application",
  }),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

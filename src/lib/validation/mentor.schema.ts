import { z } from "zod";

const currentYear = new Date().getFullYear();

export const mentorSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.string().trim().email("Email must be valid"),

    phoneNumber: z.string().trim().optional(),
    title: z.string().trim().optional(),
    profession: z.string().trim().optional(),
    company: z.string().trim().optional(),
    bio: z.string().trim().optional(),

    profileImageUrl: z
        .union([
            z.literal(""),
            z.string().trim().url("Profile image URL must be valid"),
        ])
        .optional(),

    experienceYears: z.coerce
        .number()
        .min(0, "Experience must be 0 or more"),

    startYear: z.coerce
        .number()
        .min(1900, "Start year is too old")
        .max(currentYear, "Start year cannot be in the future"),

    isCertified: z.boolean(),
});

export type MentorFormInput = z.input<typeof mentorSchema>;
export type MentorFormValues = z.output<typeof mentorSchema>;
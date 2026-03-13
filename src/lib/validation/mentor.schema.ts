import { z } from "zod";

export const mentorSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email address"),
    phoneNumber: z.string().optional(),
    title: z.string().optional(),
    profession: z.string().optional(),
    company: z.string().optional(),
    experienceYears: z.coerce.number().min(0, "Experience cannot be negative").optional(),
    bio: z.string().max(1000, "Bio is too long").optional(),
    profileImageUrl: z.union([z.string().url("Enter a valid image URL"), z.literal("")]).optional(),
    isCertified: z.boolean().default(false),
    startYear: z.coerce
        .number()
        .min(1980, "Invalid year")
        .max(new Date().getFullYear(), "Start year cannot be in the future")
        .optional(),
});

export type MentorFormValues = z.infer<typeof mentorSchema>;
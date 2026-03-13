import { z } from "zod";

export const subjectSchema = z.object({
    name: z.string().min(5, "Subject name must be at least 5 characters"),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(100, "Description must not exceed 100 characters"),
    courseImageUrl: z
        .string()
        .url("Enter a valid image URL")
        .optional()
        .or(z.literal("")),
    mentorId: z.string().min(1, "Please select a mentor"),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;
import { z } from "zod";

export const subjectSchema = z.object({
    name: z.string().trim().min(1, "Subject name is required"),
    code: z.string().trim().min(1, "Subject code is required"),
    description: z.string().trim().optional(),
    durationMonths: z.coerce.number().min(1, "Duration must be at least 1"),
    fee: z.coerce.number().min(0, "Fee must be 0 or more"),
    isActive: z.boolean(),
});

export type SubjectFormInput = z.input<typeof subjectSchema>;
export type SubjectFormValues = z.output<typeof subjectSchema>;
import { z } from "zod";

export const faqCreateSchema = z.object({
  question: z.string().trim().min(10, "Question required"),
  answer: z.string().trim().min(20, "Answer required"),
  category: z.string().trim().min(2, "Category required"),
  order: z.coerce.number().int().min(1),
});

export const faqUpdateSchema = faqCreateSchema.partial();

export type FaqCreateInput = z.infer<typeof faqCreateSchema>;
export type FaqUpdateInput = z.infer<typeof faqUpdateSchema>;

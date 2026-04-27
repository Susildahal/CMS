import {z} from "zod"

export const privacyAndTermsSchema = z.object({
    privacy: z.array(z.string()).min(1),
    terms: z.array(z.string()).min(1)
});

export const updatePrivacyAndTermsSchema = privacyAndTermsSchema.partial()

export  type  PrivacyAndTerms = z.infer<typeof privacyAndTermsSchema>
export  type  UpdatePrivacyAndTerms = z.infer<typeof updatePrivacyAndTermsSchema>

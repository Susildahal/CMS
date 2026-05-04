import {z} from "zod"

export const settingsSchema = z.object({
    privacy: z.string().min(1),
    terms: z.string().min(1),
    mission: z.string().min(1),
    vision: z.string().min(1),
    values: z.string().min(1),
    aboutus: z.string().min(1),
    socialmedia: z.array(z.object({
        name: z.string().min(1),
        url: z.string().url(),
        icon: z.string().min(1),
    })).min(1)
});

export const updateSettingsSchema = settingsSchema.partial()

export  type  Settings = z.infer<typeof settingsSchema>
export  type  UpdateSettings = z.infer<typeof updateSettingsSchema>

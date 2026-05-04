import { Schema, model, models, type Model } from "mongoose";

export interface settings {
  privacy: string;
  terms: string;
  mission: string;
  vision: string;
  values: string;
  aboutus: string;
  socialmedia: Array<{ name: string; url: string; icon: string }>;
}

const socialMediaSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String, required: true },
  },
  { _id: true }
);

const faqSchema = new Schema<settings>(
  {
    privacy: { type: String, required: true },
    terms: { type: String, required: true },
    mission: { type: String, required: true },
    vision: { type: String, required: true },
    values: { type: String, required: true },
    aboutus: { type: String, required: true },
    socialmedia: { type: [socialMediaSchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const SettingsModel: Model<settings> =
  (models.Settings as Model<settings> | undefined) ?? model<settings>("Settings", faqSchema);

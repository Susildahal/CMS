import { Schema, model, models, type Model } from "mongoose";

export interface privacyandterms {
  privacy: Array<string>;
  terms: Array<string>;
}

const faqSchema = new Schema<privacyandterms>(
  {
  privacy: { type:[ String ], required: true },
  terms: { type: [String], required: true }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const PrivacyAndTermsModel: Model<privacyandterms> =
  (models.PrivacyAndTerms as Model<privacyandterms> | undefined) ?? model<privacyandterms>("PrivacyAndTerms", faqSchema);

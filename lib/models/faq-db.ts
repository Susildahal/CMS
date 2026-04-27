import { Schema, model, models, type Model } from "mongoose";

export interface FaqDb {
  question: string;
  answer: string;
  category: string;
  order: number;
}

const faqSchema = new Schema<FaqDb>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 1 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const FaqDbModel: Model<FaqDb> =
  (models.Faq as Model<FaqDb> | undefined) ?? model<FaqDb>("Faq", faqSchema);

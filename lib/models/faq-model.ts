import type { Faq } from "@/lib/types";
import { connectToDatabase } from "@/lib/mongodb";
import { FaqDbModel } from "@/lib/models/faq-db";
import type { FaqCreateInput, FaqUpdateInput } from "@/lib/validators/faq";
import { isValidObjectId } from "mongoose";

function mapDocToFaq(
  doc: { _id: { toString: () => string } } & FaqCreateInput
): Faq {
  return {
    id: doc._id.toString(),
    question: doc.question,
    answer: doc.answer,
    category: doc.category,
    order: doc.order,
  };
}

export class FaqModel {
  static async getAll(): Promise<Faq[]> {
    await connectToDatabase();
    const items = await FaqDbModel.find().sort({ order: 1 }).lean();

    return items.map((item) => mapDocToFaq(item));
  }

  static async getById(id: string): Promise<Faq | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    await connectToDatabase();
    const item = await FaqDbModel.findById(id).lean();

    if (!item) {
      return null;
    }

    return mapDocToFaq(item);
  }

  static async create(input: FaqCreateInput): Promise<Faq> {
    await connectToDatabase();
    const created = await FaqDbModel.create(input);
    return mapDocToFaq(created.toObject());
  }

  static async update(id: string, input: FaqUpdateInput): Promise<Faq | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    await connectToDatabase();

    const updated = await FaqDbModel.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return null;
    }

    return mapDocToFaq(updated);
  }

  static async delete(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }

    await connectToDatabase();
    const deleted = await FaqDbModel.findByIdAndDelete(id).lean();
    return Boolean(deleted);
  }
}

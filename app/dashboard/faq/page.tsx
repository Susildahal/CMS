import { FaqModel } from "@/lib/models/faq-model";
import FaqClient from "./faq-client";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const initialItems = await FaqModel.getAll();

  return <FaqClient initialItems={initialItems} />;
}

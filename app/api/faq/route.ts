import { NextResponse } from 'next/server';
import { FaqModel } from "@/lib/models/faq-model";
import { faqCreateSchema } from "@/lib/validators/faq";

export async function GET() {
  try {
    const faqs = await FaqModel.getAll();
    return NextResponse.json({ data: faqs });
  } catch {
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = faqCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid FAQ payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const created = await FaqModel.create(parsed.data);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
  }
}

export const runtime = "nodejs";

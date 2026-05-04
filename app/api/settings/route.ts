import { NextResponse } from "next/server";
import { SettingsModel } from "@/lib/models/setting-db";
import { connectToDatabase } from "@/lib/mongodb";
import { updateSettingsSchema } from "@/lib/validators/setting";


export async function GET() {
    try {
        await connectToDatabase();
        const settings = await SettingsModel.findOne();
        if (settings === null) {
            return NextResponse.json({ error: "Settings not found" }, { status: 404 });
        }
        return NextResponse.json({ data: settings });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ error: "Error fetching settings" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid settings payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const incoming = parsed.data;
    if (Object.keys(incoming).length === 0) {
      return NextResponse.json({ error: "No settings fields provided" }, { status: 400 });
    }

    const existingSettings = body.id
      ? await SettingsModel.findById(body.id)
      : await SettingsModel.findOne();

    let result;

    if (existingSettings) {
      result = await SettingsModel.findByIdAndUpdate(
        existingSettings._id,
        { $set: incoming },
        { new: true, runValidators: true }
      );
    } else {
      result = await SettingsModel.create({
        privacy: "",
        terms: "",
        mission: "",
        vision: "",
        values: "",
        aboutus: "",
        socialmedia: [],
        ...incoming,
      });
    }

    return NextResponse.json({ 
      message: existingSettings ? "Settings updated" : "Settings created",
      data: result 
    });

  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export const runtime = "nodejs";





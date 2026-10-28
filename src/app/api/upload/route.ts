import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { isAdminAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin authorization required" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || ".jpg";
    const safeBase = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .toLowerCase()
      .slice(0, 40);
    const filename = `${Date.now()}-${safeBase || "dish"}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error("[POST /api/upload] Error:", error);
    return NextResponse.json(
      { error: "Failed to upload dish image" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import supabaseServer from "@/backend/config/supabaseServer";

export const dynamic = "force-dynamic";

const MAX_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024;

function parseBucketName(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9/_\.-]/g, "_").replace(/\/{2,}/g, "/").replace(/^\/+|\/+$/g, "");
}

function extensionFromName(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx) : "";
}

function randomSuffix() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function ensureBucketExists(bucketName: string) {
  const { data: buckets, error: listError } = await supabaseServer.storage.listBuckets();
  if (listError) {
    throw new Error(listError.message || "Failed to list storage buckets.");
  }

  const exists = (buckets ?? []).some((bucket: { name?: string }) => bucket.name === bucketName);
  if (exists) {
    return;
  }

  const { error: createError } = await supabaseServer.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: MAX_UPLOAD_SIZE_BYTES,
  });

  if (createError) {
    throw new Error(createError.message || `Failed to create bucket '${bucketName}'.`);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const bucket = parseBucketName(formData.get("bucket"));
    const folderEntry = formData.get("folder");
    const pathEntry = formData.get("path");
    const fileEntry = formData.get("file");

    if (!bucket) {
      return NextResponse.json({ error: "Bucket is required." }, { status: 400 });
    }

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    if (fileEntry.size <= 0) {
      return NextResponse.json({ error: "File is empty." }, { status: 400 });
    }

    if (fileEntry.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum ${Math.floor(MAX_UPLOAD_SIZE_BYTES / (1024 * 1024))}MB.` },
        { status: 400 }
      );
    }

    const folder = typeof folderEntry === "string" ? sanitizePathSegment(folderEntry) || "uploads" : "uploads";
    const requestedPath = typeof pathEntry === "string" ? sanitizePathSegment(pathEntry) : "";

    const originalName = fileEntry.name || "upload.bin";
    const baseName = originalName.replace(extensionFromName(originalName), "").replace(/[^a-zA-Z0-9._-]/g, "_") || "file";
    const ext = extensionFromName(originalName);
    const fallbackPath = `${folder}/${baseName}_${randomSuffix()}${ext}`;
    const uploadPath = requestedPath || fallbackPath;

    await ensureBucketExists(bucket);

    const { error: uploadError } = await supabaseServer.storage
      .from(bucket)
      .upload(uploadPath, fileEntry, {
        cacheControl: "3600",
        upsert: false,
        contentType: fileEntry.type || "application/octet-stream",
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message || "Upload failed." }, { status: 500 });
    }

    const { data } = supabaseServer.storage.from(bucket).getPublicUrl(uploadPath);

    const kind =
      fileEntry.type === "image/gif"
        ? "gif"
        : fileEntry.type.startsWith("image/")
          ? "image"
          : fileEntry.type.startsWith("video/")
            ? "video"
            : "file";

    return NextResponse.json({
      name: originalName,
      url: data.publicUrl,
      path: uploadPath,
      mimeType: fileEntry.type || "application/octet-stream",
      size: fileEntry.size,
      kind,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected upload error.",
      },
      { status: 500 }
    );
  }
}

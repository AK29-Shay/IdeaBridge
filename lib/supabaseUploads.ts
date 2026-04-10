import { supabase } from "@/lib/supabaseClient";

export type ThreadMediaKind = "image" | "gif" | "video";
export type UploadedAssetKind = ThreadMediaKind | "file";

export interface UploadedSupabaseFile {
  name: string;
  url: string;
  path: string;
  mimeType: string;
  size: number;
  kind: UploadedAssetKind;
}

const MB = 1024 * 1024;
const configuredMaxMb = Number(process.env.NEXT_PUBLIC_SUPABASE_UPLOAD_MAX_MB ?? "50");

export const SUPABASE_MAX_UPLOAD_BYTES =
  Number.isFinite(configuredMaxMb) && configuredMaxMb > 0 ? configuredMaxMb * MB : 50 * MB;

export const THREAD_MEDIA_ACCEPT =
  "image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime";
export const DYNAMIC_FORM_ACCEPT = "*/*,.zip,.tar,.gz,.tgz,.bz2,.xz,.rar,.7z";

const THREAD_MEDIA_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function extensionOf(fileName: string) {
  const idx = fileName.lastIndexOf(".");
  return idx >= 0 ? fileName.slice(idx) : "";
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function detectKind(file: File): UploadedAssetKind {
  if (file.type === "image/gif") return "gif";
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "file";
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateSupabaseFileSize(file: File) {
  if (file.size > SUPABASE_MAX_UPLOAD_BYTES) {
    return `${file.name} is too large. Maximum allowed is ${formatBytes(SUPABASE_MAX_UPLOAD_BYTES)}.`;
  }
  return null;
}

export function validateThreadMediaFile(file: File) {
  const sizeError = validateSupabaseFileSize(file);
  if (sizeError) return sizeError;

  if (!THREAD_MEDIA_TYPES.has(file.type)) {
    return `${file.name} is not supported for thread media. Use image, gif, or video.`;
  }
  return null;
}

export function validateDynamicFormFile(file: File) {
  return validateSupabaseFileSize(file);
}

async function uploadFileToBucket(params: {
  bucket: string;
  folder: string;
  file: File;
}): Promise<UploadedSupabaseFile> {
  const { bucket, folder, file } = params;

  if (!bucket) {
    throw new Error("Supabase storage bucket name is missing.");
  }

  const ext = extensionOf(file.name);
  const safeBaseName = sanitizeFileName(file.name.replace(ext, ""));
  const path = `${folder}/${safeBaseName}_${randomId()}${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    name: file.name,
    url: data.publicUrl,
    path,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    kind: detectKind(file),
  };
}

export async function uploadThreadMediaFile(file: File) {
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_THREAD_MEDIA_BUCKET ?? "thread-media";
  return uploadFileToBucket({ bucket, folder: "threads", file });
}

export async function uploadDynamicFormFile(file: File) {
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_DYNAMIC_FORM_BUCKET ?? "dynamic-form-files";
  return uploadFileToBucket({ bucket, folder: "dynamic-form", file });
}

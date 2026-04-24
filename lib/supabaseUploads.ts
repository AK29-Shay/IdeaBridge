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
export const PROFILE_PHOTO_ACCEPT = "image/png,image/jpeg,image/webp";

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

export function validateProfilePhotoFile(file: File) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    return `${file.name} is not supported. Use PNG, JPG, or WEBP.`;
  }
  return null;
}

async function optimizeProfilePhoto(file: File): Promise<File> {
  if (typeof window === "undefined") {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image."));
      img.src = imageUrl;
    });

    const MAX_DIMENSION = 2048;
    const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9)
    );
    if (!blob) {
      return file;
    }

    const safeName = file.name.replace(/\.[^/.]+$/, "") || "profile-photo";
    return new File([blob], `${safeName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function getUploadedField<T extends keyof UploadedSupabaseFile>(
  payload: Partial<UploadedSupabaseFile> | { error?: unknown } | null,
  key: T
) {
  if (!payload || typeof payload !== "object" || !(key in payload)) {
    return undefined;
  }

  return (payload as Partial<UploadedSupabaseFile>)[key];
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
  const normalizedFolder = folder.replace(/^\/+|\/+$/g, "") || "uploads";
  const desiredPath = `${normalizedFolder}/${safeBaseName}_${randomId()}${ext}`;

  const formData = new FormData();
  formData.append("bucket", bucket);
  formData.append("folder", normalizedFolder);
  formData.append("path", desiredPath);
  formData.append("file", file);

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as Partial<UploadedSupabaseFile> | { error?: unknown } | null;

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String(payload.error ?? "Upload failed.")
        : "Upload failed.";
    throw new Error(message);
  }

  const uploadedName = getUploadedField(payload, "name");
  const uploadedUrl = getUploadedField(payload, "url");
  const uploadedPath = getUploadedField(payload, "path");
  const uploadedMimeType = getUploadedField(payload, "mimeType");
  const uploadedSize = getUploadedField(payload, "size");
  const uploadedKind = getUploadedField(payload, "kind");

  return {
    name: typeof uploadedName === "string" ? uploadedName : file.name,
    url: typeof uploadedUrl === "string" ? uploadedUrl : "",
    path: typeof uploadedPath === "string" ? uploadedPath : desiredPath,
    mimeType: typeof uploadedMimeType === "string" ? uploadedMimeType : file.type || "application/octet-stream",
    size: typeof uploadedSize === "number" ? uploadedSize : file.size,
    kind:
      uploadedKind === "image" ||
      uploadedKind === "gif" ||
      uploadedKind === "video" ||
      uploadedKind === "file"
        ? uploadedKind
      : detectKind(file),
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

export async function uploadProfilePhoto(file: File) {
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_PROFILE_PHOTO_BUCKET ?? "profile-photos";
  const optimized = await optimizeProfilePhoto(file);
  return uploadFileToBucket({ bucket, folder: "avatars", file: optimized });
}

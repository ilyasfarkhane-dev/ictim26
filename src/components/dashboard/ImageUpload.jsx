import { useId, useRef, useState } from "react";
import { HiOutlineCloudArrowUp, HiOutlineTrash } from "react-icons/hi2";
import { uploadImage, isCloudinaryConfigured } from "../../lib/cloudinary";
import { withBase } from "../../config/paths";
import DashButton from "./DashButton";
import CloudinaryImage from "../CloudinaryImage";

function resolvePreviewSrc(src) {
  if (!src) return "";
  if (src.startsWith("/") && !src.startsWith("//")) return withBase(src);
  return src;
}

function isImageFile(file) {
  if (!file) return false;
  if (file.type?.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|avif|bmp|svg|heic|heif)$/i.test(file.name ?? "");
}

export default function ImageUpload({
  label,
  value = "",
  onChange,
  folder,
  previewClassName = "h-28 w-full object-cover rounded-xl",
  hint,
  required = false,
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const canUpload = isCloudinaryConfigured && !uploading;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file)) {
      setError("Please select an image file (JPG, PNG, WebP, etc.).");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    setError("");
    try {
      const { url } = await uploadImage(file, folder);
      onChange(url);
    } catch (err) {
      setError(err.message || "Image upload failed. Try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const dropzoneClass = `flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-dash-muted transition-colors duration-200 ${
    canUpload
      ? "border-dash-border bg-dash-bg/50 hover:border-dash-primary hover:bg-blue-50/50 hover:text-dash-primary cursor-pointer"
      : "border-dash-border/60 bg-dash-bg/30 opacity-60 cursor-not-allowed"
  }`;

  return (
    <div className="space-y-3">
      {label && (
        <span className="block text-sm font-medium text-dash-text">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
      )}

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="sr-only"
        onChange={handleFile}
        disabled={!canUpload}
        tabIndex={-1}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-dash-border bg-dash-bg">
          <CloudinaryImage
            src={resolvePreviewSrc(value)}
            alt={label || "Preview"}
            width={400}
            className={previewClassName}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer shadow-sm dash-focus-ring"
            aria-label="Remove image"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label htmlFor={canUpload ? inputId : undefined} className={dropzoneClass}>
          <HiOutlineCloudArrowUp className="w-8 h-8" />
          <span className="text-sm font-medium">
            {uploading ? "Uploading…" : "Choose image file"}
          </span>
          <span className="text-xs">PNG, JPG, WebP · max 10 MB</span>
        </label>
      )}

      {value && isCloudinaryConfigured && (
        <DashButton
          type="button"
          variant="secondary"
          size="sm"
          disabled={!canUpload}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Replace image"}
        </DashButton>
      )}

      {!isCloudinaryConfigured && (
        <p className="text-xs text-amber-600">
          Cloudinary upload is disabled. Add{" "}
          <code className="text-dash-primary">VITE_CLOUDINARY_CLOUD_NAME</code> and{" "}
          <code className="text-dash-primary">VITE_CLOUDINARY_UPLOAD_PRESET</code> to{" "}
          <code className="text-dash-primary">.env</code>, then restart the dev server.
        </p>
      )}

      {hint && <p className="text-xs text-dash-muted">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {required && !value && (
        <p className="text-xs text-dash-muted">A photo is required before saving.</p>
      )}
    </div>
  );
}

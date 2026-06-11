import { useRef, useState } from "react";
import { HiOutlineCloudArrowUp, HiOutlineTrash } from "react-icons/hi2";
import { uploadImage, isCloudinaryConfigured } from "../../lib/cloudinary";
import DashButton from "./DashButton";
import CloudinaryImage from "../CloudinaryImage";

export default function ImageUpload({
  label,
  value = "",
  onChange,
  folder,
  previewClassName = "h-28 w-full object-cover rounded-xl",
  hint,
  required = false,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const { url } = await uploadImage(file, folder);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const openPicker = () => {
    if (!uploading && isCloudinaryConfigured) inputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {label && (
        <span className="block text-sm font-medium text-dash-text">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFile}
        disabled={uploading || !isCloudinaryConfigured}
        required={required && !value}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-dash-border bg-dash-bg">
          <CloudinaryImage
            src={value}
            alt={label || "Preview"}
            width={400}
            className={previewClassName}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-red-600 hover:bg-red-50 transition-colors cursor-pointer shadow-sm"
            aria-label="Remove image"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading || !isCloudinaryConfigured}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-dash-border bg-dash-bg/50 px-4 py-8 text-dash-muted hover:border-dash-primary hover:text-dash-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiOutlineCloudArrowUp className="w-8 h-8" />
          <span className="text-sm font-medium">
            {uploading ? "Uploading…" : "Choose image file"}
          </span>
          <span className="text-xs">PNG, JPG, WebP · max 10 MB</span>
        </button>
      )}

      {value && isCloudinaryConfigured && (
        <DashButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={openPicker}
          disabled={uploading}
        >
          {uploading ? "Uploading…" : "Replace image"}
        </DashButton>
      )}

      {!isCloudinaryConfigured && (
        <p className="text-xs text-amber-600">
          Cloudinary upload is disabled. Add{" "}
          <code className="text-dash-primary">VITE_CLOUDINARY_CLOUD_NAME</code> and{" "}
          <code className="text-dash-primary">VITE_CLOUDINARY_UPLOAD_PRESET</code> to{" "}
          <code className="text-dash-primary">.env</code> and restart the dev server.
        </p>
      )}

      {hint && <p className="text-xs text-dash-muted">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

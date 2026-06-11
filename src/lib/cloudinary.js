const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryConfig = { cloudName, uploadPreset };

export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset);

export const CLOUDINARY_FOLDERS = {
  speakers: "ictim/speakers",
  workshops: "ictim/workshops",
  dates: "ictim/dates",
  sponsors: "ictim/sponsors",
  hero: "ictim/hero",
  general: "ictim/general",
};

/**
 * Build an optimized Cloudinary delivery URL.
 * Pass-through for non-Cloudinary URLs (legacy / external).
 */
export function getCloudinaryUrl(
  src,
  { width, height, crop = "fill", quality = "auto", format = "auto" } = {}
) {
  if (!src) return "";

  if (!src.includes("res.cloudinary.com")) {
    return src;
  }

  if (!width && !height) return src;

  const [base, afterUpload] = src.split("/upload/");
  if (!afterUpload) return src;

  const firstSegment = afterUpload.split("/")[0];
  if (/^(w_|h_|c_|q_|f_)/.test(firstSegment)) return src;

  const transforms = [
    width && `w_${width}`,
    height && `h_${height}`,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`,
  ]
    .filter(Boolean)
    .join(",");

  return `${base}/upload/${transforms}/${afterUpload}`;
}

export async function uploadImage(file, folder = CLOUDINARY_FOLDERS.general) {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env");
  }

  if (!file?.type?.startsWith("image/")) {
    throw new Error("Please select an image file");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image must be under 10 MB");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Image upload failed");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
  };
}

export async function deleteImage(publicId) {
  if (!publicId) return;
  // Deletes require server-side API key — document for future Edge Function
  void publicId;
}

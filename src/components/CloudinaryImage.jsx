import { getCloudinaryUrl } from "../lib/cloudinary";

export default function CloudinaryImage({
  src,
  alt = "",
  width,
  height,
  crop = "fill",
  className = "",
  loading = "lazy",
  ...props
}) {
  const url = getCloudinaryUrl(src, { width, height, crop });

  if (!url) return null;

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      {...props}
    />
  );
}

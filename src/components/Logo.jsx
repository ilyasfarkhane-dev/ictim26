import { baseUrl } from "../config/paths";
import { useConference } from "../hooks/useConference";
import CloudinaryImage from "./CloudinaryImage";

export default function Logo({ className = "", size = "md" }) {
  const { conference } = useConference();
  const sizes = {
    sm: "h-8",
    md: "h-10 sm:h-11",
    lg: "h-12 sm:h-14",
  };

  const src = conference.logoUrl || `${baseUrl}assets/logo_tim.png`;

  return (
    <a href={`${baseUrl}#home`} className={`inline-flex items-center group cursor-pointer ${className}`}>
      <CloudinaryImage
        src={src}
        alt="ICTIM'26 — The 8th International Conference on Information Technology and Modeling"
        width={200}
        crop="fit"
        className={`${sizes[size]} w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]`}
        loading="eager"
      />
    </a>
  );
}

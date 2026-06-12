import { conference, footerLinks } from "./conference";
import { normalizeFooter } from "../lib/footer";

/** Default footer payload (columns derived from legacy footerLinks). */
export const footer = normalizeFooter(
  { columns: null, legacy: footerLinks },
  null,
  conference
);

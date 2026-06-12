import { HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin } from "react-icons/hi2";
import Container from "../components/Container";
import Logo from "../components/Logo";
import { useConference } from "../hooks/useConference";
import {
  footerAboutText,
  footerCopyrightText,
  getVisibleFooterColumns,
} from "../lib/footer";

export default function Footer() {
  const { conference, footer } = useConference();
  const columns = getVisibleFooterColumns(footer);
  const about = footerAboutText(footer, conference);
  const copyright = footerCopyrightText(footer, conference);
  const contact = footer.contact ?? {};
  const emails = (contact.emails ?? []).filter(Boolean);

  return (
    <footer id="contact" className="bg-navy text-white pt-16 pb-8">
      <Container>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size="lg" />
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xs">{about}</p>
          </div>

          {columns.map((column) => (
            <div key={column.id}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                {column.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer"
                      {...(link.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              {footer.contactTitle || "Contact"}
            </h4>
            <ul className="mt-4 space-y-3">
              {contact.address ? (
                <li className="flex items-start gap-2.5 text-sm text-slate-400">
                  <HiOutlineMapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                  {contact.address}
                </li>
              ) : null}
              {contact.phone ? (
                <li className="flex items-center gap-2.5 text-sm text-slate-400">
                  <HiOutlinePhone className="w-4 h-4 shrink-0 text-accent" />
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    {contact.phone}
                  </a>
                </li>
              ) : null}
              {emails.map((email) => (
                <li key={email} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <HiOutlineEnvelope className="w-4 h-4 shrink-0 text-accent" />
                  <a
                    href={`mailto:${email}`}
                    className="hover:text-white transition-colors duration-200 cursor-pointer break-all"
                  >
                    {email}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-slate-500 text-center sm:text-left">{copyright}</p>
        </div>
      </Container>
    </footer>
  );
}

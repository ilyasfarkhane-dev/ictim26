import { HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin } from "react-icons/hi2";
import Container from "../components/Container";
import Logo from "../components/Logo";
import { useConference } from "../hooks/useConference";

export default function Footer() {
  const { conference, footerLinks } = useConference();
  return (
    <footer id="contact" className="bg-navy text-white pt-16 pb-8">
      <Container>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size="lg" />
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xs">
              {conference.fullName}. Organized by {conference.organizer} at{" "}
              {conference.location}.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                {title}
              </h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
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
              Contact
            </h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-slate-400">
                <HiOutlineMapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                {conference.contact.address}
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <HiOutlinePhone className="w-4 h-4 shrink-0 text-accent" />
                <a href={`tel:${conference.contact.phone.replace(/\s/g, "")}`} className="hover:text-white transition-colors cursor-pointer">
                  {conference.contact.phone}
                </a>
              </li>
              {conference.contact.emails.map((email) => (
                <li key={email} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <HiOutlineEnvelope className="w-4 h-4 shrink-0 text-accent" />
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors cursor-pointer break-all">
                    {email}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-slate-500 text-center sm:text-left">
            &copy; {new Date().getFullYear()} {conference.name} by {conference.organizer}. All
            Rights Reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}

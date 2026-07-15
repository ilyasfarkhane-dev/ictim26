import { motion } from "framer-motion";
import {
  HiOutlineMapPin,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import Container from "../components/Container";
import SectionHeader from "../components/SectionHeader";
import { useConference } from "../hooks/useConference";
import { fadeUp } from "../utils/animations";

const MAP_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3618.8540135955004!2d-7.5413365!3d33.566430800000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda633261bbe100f%3A0xe48b03dd8c6794a0!2sFacult%C3%A9%20des%20Sciences%20Ben%20M%E2%80%99Sick!5e1!3m2!1sfr!2sma!4v1784112925556!5m2!1sfr!2sma";

const MAP_EXTERNAL_URL =
  "https://www.google.com/maps/search/?api=1&query=Facult%C3%A9%20des%20Sciences%20Ben%20M%27Sick";

export default function LocationMap() {
  const { conference } = useConference();
  const address = conference.contact?.address || conference.location;
  const mapTitle = `Map of ${conference.location}`;

  return (
    <section id="venue" className="py-20 lg:py-28 bg-section">
      <Container>
        <SectionHeader
          title="Conference Venue"
          subtitle={`${conference.venue} — join us on campus for ${conference.name}.`}
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="overflow-hidden rounded-3xl border border-border bg-white shadow-premium"
        >
          <div className="grid lg:grid-cols-[minmax(0,280px)_1fr]">
            <div className="flex flex-col justify-between gap-8 border-b border-border p-7 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-light-blue text-primary">
                  <HiOutlineMapPin className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Location
                </p>
                <h3 className="mt-2 text-xl font-bold leading-snug text-navy sm:text-2xl">
                  {conference.location}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {address}
                </p>
                <p className="mt-2 text-sm font-medium text-navy">
                  {conference.city}
                </p>
              </div>

              <a
                href={MAP_EXTERNAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-primary/15 bg-light-blue px-4 py-2.5 text-sm font-semibold text-primary transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
              >
                Open in Google Maps
                <HiOutlineArrowTopRightOnSquare
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </a>
            </div>

            <div className="relative min-h-[280px] sm:min-h-[360px] lg:min-h-[450px]">
              <iframe
                title={mapTitle}
                src={MAP_EMBED_SRC}
                width="100%"
                height="100%"
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

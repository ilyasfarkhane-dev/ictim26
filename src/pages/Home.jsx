import Hero from "../sections/Hero";
import ImportantDates from "../sections/ImportantDates";
import QuickLinks from "../sections/QuickLinks";
import EventCategories from "../sections/EventCategories";
import CallForPapers from "../sections/CallForPapers";
import Speakers from "../sections/Speakers";
import Committees from "../sections/Committees";
import SubmissionGuidelines from "../sections/SubmissionGuidelines";
import RegisterPricing from "../sections/RegisterPricing";
import Sponsors from "../sections/Sponsors";
import CTA from "../sections/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <ImportantDates />
      <QuickLinks />
      <EventCategories />
      <CallForPapers />
      <Speakers />
      <Committees />
      <SubmissionGuidelines />
      <RegisterPricing />
      <Sponsors />
      <CTA />
    </>
  );
}

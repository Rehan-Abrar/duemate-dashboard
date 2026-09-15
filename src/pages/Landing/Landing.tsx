import "./LandingNew.css";
import { Footer, Nav } from "./components/Chrome";
import Hero from "./sections/Hero";
import Problem from "./sections/Problem";
import HowItWorks from "./sections/HowItWorks";
import TimetableSection from "./sections/TimetableSection";
import Transform from "./sections/Transform";
import Reminders from "./sections/Reminders";
import Faq from "./sections/Faq";
import FinalCta from "./sections/FinalCta";

interface LandingProps {
  onGetStarted: () => void;
}

export function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="landing-new min-h-screen bg-paper font-sans">
      <Nav onGetStarted={onGetStarted} />
      <main>
        <Hero onGetStarted={onGetStarted} />
        <Problem />
        <HowItWorks />
        <TimetableSection />
        <Transform />
        <Reminders />
        <Faq />
        <FinalCta onGetStarted={onGetStarted} />
      </main>
      <Footer />
    </div>
  );
}

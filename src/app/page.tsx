import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Projects } from "@/components/sections/Projects";
import { Experience } from "@/components/sections/Experience";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { SectionDots } from "@/components/layout/SectionDots";

export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <Hero />
      <Marquee />
      <Projects />
      <Experience />
      <About />
      <Contact />
      <SectionDots />
    </main>
  );
}

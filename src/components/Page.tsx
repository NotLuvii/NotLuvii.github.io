import { LocalNav } from "@/components/layout/LocalNav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Highlights } from "@/components/sections/Highlights";
import { Projects } from "@/components/sections/Projects";
import { Numbers } from "@/components/sections/Numbers";
import { Experience } from "@/components/sections/Experience";
import { Skills } from "@/components/sections/Skills";
import { Contact } from "@/components/sections/Contact";

/** The whole page. Rendered by the Next.js app and by the artifact build alike. */
export function Page() {
  return (
    <>
      <LocalNav />
      <main id="main">
        <Hero />
        <Highlights />
        <Projects />
        <Numbers />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

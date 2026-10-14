import { site } from "@/content/site";
import { ChevronLink } from "@/components/ui/links";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { Reveal } from "@/components/ui/Reveal";

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-mist py-24 text-center md:py-32">
      <Reveal className="mx-auto max-w-[1180px] px-gutter">
        <h2 id="contact-title" className="type-hero text-ink">
          Let’s talk.
        </h2>
        {site.availability && <p className="type-intro mx-auto mt-5 max-w-[40ch] text-ash">{site.availability}</p>}
        <div className="mt-10">
          <CopyEmail email={site.email} />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[17px]">
          <ChevronLink href={`mailto:${site.email}`}>Write an email</ChevronLink>
          <ChevronLink href={site.linkedin.url} external>
            LinkedIn
          </ChevronLink>
          <ChevronLink href={site.github.url} external>
            GitHub
          </ChevronLink>
          {site.resume && (
            <ChevronLink href={site.resume} download>
              Résumé (PDF)
            </ChevronLink>
          )}
        </div>
        <p className="type-small mt-10 text-ash">
          Based in {site.location.city}, {site.location.region}.
        </p>
      </Reveal>
    </section>
  );
}

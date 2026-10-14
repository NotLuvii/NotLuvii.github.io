import { site } from "@/content/site";
import { TextLink } from "@/components/ui/links";
import { CopyEmail } from "@/components/ui/CopyEmail";

/** The close of the page: what I'm looking for, said large, then the address and the other ways to reach me. */
export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-panel py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-gutter">
        <h2 id="contact-title" className="type-section text-text-3">
          Contact
        </h2>
        {site.availability && <p className="type-statement mt-6 max-w-[30ch] text-text">{site.availability}</p>}
        <div className="mt-12">
          <CopyEmail email={site.email} />
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-1 text-[17px]">
          <li>
            <TextLink href={`mailto:${site.email}`}>Write an email</TextLink>
          </li>
          <li>
            <TextLink href={site.linkedin.url} external>
              LinkedIn
            </TextLink>
          </li>
          <li>
            <TextLink href={site.github.url} external>
              GitHub
            </TextLink>
          </li>
          {site.resume && (
            <li>
              <TextLink href={site.resume} download>
                Resume (PDF)
              </TextLink>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}

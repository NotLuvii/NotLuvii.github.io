import { site } from "@/content/site";
import { ButtonLink, TextLink, pairedPill } from "@/components/ui/links";
import { CopyEmail } from "@/components/ui/CopyEmail";

/** The close of the page, one wide tile: what I'm looking for, said large; the address; two buttons; the other ways to reach me. */
export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title">
      <h2 id="contact-title" className="sr-only">
        Contact
      </h2>
      <div className="tile-grid">
        <div className="tile tile-wide px-gutter py-16 text-center md:py-24">
          {site.availability && <p className="type-statement mx-auto max-w-[18em] text-text min-[834px]:type-section">{site.availability}</p>}
          <div className="mt-8">
            <CopyEmail email={site.email}>
              <ButtonLink href={`mailto:${site.email}`} variant="light" className={pairedPill}>
                Write an email
              </ButtonLink>
            </CopyEmail>
          </div>
          <ul className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-1 text-[17px]">
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
      </div>
    </section>
  );
}

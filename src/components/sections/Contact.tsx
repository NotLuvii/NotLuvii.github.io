import { site } from "@/content/site";
import { ButtonLink, TextLink, pairedPill } from "@/components/ui/links";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { Ink } from "@/components/ink/Ink";
import { Note } from "@/components/ink/Note";
import { arrow } from "@/lib/ink";

/**
 * The close of the page, one wide tile: what I'm looking for, said large; the email button, with a
 * note in ink saying where it goes; the other ways to reach me.
 */
export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title">
      <h2 id="contact-title" className="sr-only">
        Contact
      </h2>
      <div className="tile-grid">
        <div className="tile tile-wide px-gutter py-16 text-center md:py-24">
          {site.availability && <p className="type-statement mx-auto max-w-[18em] text-text min-[834px]:type-section">{site.availability}</p>}
          <div className="mt-8 flex justify-center">
            <div className="relative">
              {/* A note pointing at the button: in the margin to its left from 1360px (where there is room), above it below that. */}
              <div className="contact-note">
                <Note>goes straight to my inbox</Note>
                <Ink paths={arrow([[4, 30], [50, 12], [100, 24]], 51)} w={108} h={40} className="ml-1 hidden h-[40px] w-[108px] min-[1360px]:block" />
                <Ink paths={arrow([[16, 2], [6, 22], [16, 44]], 53)} w={28} h={48} className="mb-2 mt-1 block h-[48px] w-[28px] min-[1360px]:hidden" />
              </div>
              <CopyEmail email={site.email}>
                <ButtonLink href={`mailto:${site.email}`} variant="light" className={pairedPill}>
                  Write an email
                </ButtonLink>
              </CopyEmail>
            </div>
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

import { site } from "@/content/site";
import { TextLink } from "@/components/ui/links";
import { CopyEmail } from "@/components/ui/CopyEmail";

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="border-t border-line py-28 md:py-40">
      <div className="mx-auto max-w-[1200px] px-gutter">
        <h2 id="contact-title" className="type-display text-text">
          Contact
        </h2>
        {site.availability && <p className="type-lede mt-5 max-w-[52ch] text-text-2">{site.availability}</p>}
        <div className="mt-12">
          <CopyEmail email={site.email} />
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-1 text-[17px]">
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

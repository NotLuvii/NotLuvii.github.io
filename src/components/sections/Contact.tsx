import { site } from "@/content/site";
import { TextLink } from "@/components/ui/links";
import { CopyEmail } from "@/components/ui/CopyEmail";

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1080px] px-gutter">
        <h2 id="contact-title" className="type-section text-ink">
          Contact
        </h2>
        {site.availability && <p className="mt-3 max-w-[60ch] text-[17px] text-ash">{site.availability}</p>}
        <div className="mt-8">
          <CopyEmail email={site.email} />
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-7 gap-y-1 text-[17px]">
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

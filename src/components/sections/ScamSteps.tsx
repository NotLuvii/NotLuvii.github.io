import { crops, type FeaturedProject } from "@/content/projects";
import { Crop } from "@/components/ui/Crop";

/**
 * The scam detection tool's story in three real crops of one capture, in order: the message (its
 * quoted phrases underlined in ink), the warning signs the rules matched, and the verdict. From
 * 1024px each step is a row, its words beside its crop; below that they stack. Nothing moves but
 * the underlines drawing in as the message scrolls into view.
 */
export function ScamSteps({ p }: { p: FeaturedProject }) {
  return (
    <ol className="steps">
      {p.chapter!.steps!.map((s, i) => (
        <li key={s.title} className="step">
          <div className="step-text">
            <p aria-hidden className="step-number">
              {i + 1}
            </p>
            <h4 className="type-title text-text">{s.title}</h4>
            <p className="mt-f8 max-w-[34ch] text-[17px] leading-[1.618] text-text-2">{s.text}</p>
          </div>
          <Crop crop={crops[s.crop]} sizes="(min-width: 1024px) 660px, 90vw" />
        </li>
      ))}
    </ol>
  );
}

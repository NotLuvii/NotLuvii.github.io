import { evidence, STATUS, type EvidenceStatus } from "@/content/evidence";
import { toolkit } from "@/content/experience";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/Reveal";

const dot: Record<EvidenceStatus, string> = { work: "bg-ok", project: "bg-blue", learning: "bg-learning" };

function Status({ status }: { status: EvidenceStatus }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-[14px] font-semibold text-ink">
      <span aria-hidden className={cn("size-2.5 rounded-full", dot[status])} />
      {STATUS[status].label}
    </span>
  );
}

/** The evidence table, set like Apple's tech specs: a label on the left, the detail on the right. */
export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1180px] px-gutter">
        <Reveal>
          <h2 id="skills-title" className="type-headline text-ink">
            What I bring.
          </h2>
          <p className="type-intro mt-5 max-w-[52ch] text-ash">
            What quality and manufacturing software roles ask for, and where I’ve done it. Where I haven’t yet, it
            says so.
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3" aria-label="Key">
            {(Object.keys(STATUS) as EvidenceStatus[]).map((s) => (
              <li key={s} className="flex items-center gap-2.5">
                <Status status={s} />
                <span className="text-[14px] text-ash">{STATUS[s].meaning}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <dl className="mt-14 border-b border-line">
          {evidence.map((row) => (
            <div key={row.requirement} className="grid gap-x-8 gap-y-3 border-t border-line py-7 md:grid-cols-12">
              <dt className="text-[21px] font-semibold leading-[1.24] tracking-[-0.016em] text-ink md:col-span-4">{row.requirement}</dt>
              <dd className="md:col-span-6">
                <ul className="space-y-1.5 text-[17px] leading-[1.47] text-ash">
                  {row.evidence.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </dd>
              <dd className="md:col-span-2 md:text-right">
                <Status status={row.status} />
              </dd>
            </div>
          ))}
        </dl>

        <h3 className="type-title mt-24 text-ink">Toolkit.</h3>
        <dl className="mt-8 border-b border-line">
          {toolkit.map((g) => (
            <div key={g.group} className="grid gap-x-8 gap-y-2 border-t border-line py-6 md:grid-cols-12">
              <dt className="text-[17px] font-semibold text-ink md:col-span-4">{g.group}</dt>
              <dd className="text-[17px] text-ash md:col-span-8">{g.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

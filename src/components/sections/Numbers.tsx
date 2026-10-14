import { numbers } from "@/content/numbers";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";

export function Numbers() {
  return (
    <section aria-labelledby="numbers-title" className="bg-white py-24 md:py-32">
      <Reveal className="mx-auto max-w-[1180px] px-gutter text-center">
        <h2 id="numbers-title" className="type-headline text-ink">
          Results you can measure.
        </h2>
      </Reveal>
      <div className="mx-auto mt-16 grid max-w-[1180px] gap-14 px-gutter text-center md:grid-cols-3 md:gap-8">
        {numbers.map((n, i) => (
          <Reveal key={n.from} delay={i * 0.1}>
            <p className="text-[17px] font-semibold text-ink">{n.from}</p>
            <p className="mt-2 text-[clamp(4.5rem,9vw,7.5rem)] font-semibold leading-none tracking-[-0.04em]">
              <CountUp value={n.value} suffix={n.suffix} className="gradient-figure" />
            </p>
            <p className="mx-auto mt-4 max-w-[26ch] text-[17px] leading-[1.47] text-ash">
              {n.label}
              <a href={`#footnote-${n.footnote}`} className="ml-0.5 align-super text-[11px] hover:text-ink" aria-label={`Footnote ${n.footnote}`}>
                {n.footnote}
              </a>
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

import { projects, type Project } from "@/content/projects";
import { cn } from "@/lib/cn";
import { ChevronLink } from "@/components/ui/links";
import { Reveal } from "@/components/ui/Reveal";
import { Stage } from "@/components/visuals/Stage";

const span: Record<Project["size"], string> = {
  wide: "md:col-span-6 lg:col-span-4",
  narrow: "md:col-span-3 lg:col-span-2",
  half: "md:col-span-3",
};

function Figure({ figure }: { figure: NonNullable<Project["figure"]> }) {
  return (
    <p className="mt-6">
      <span className="gradient-figure block text-[56px] font-semibold leading-none tracking-[-0.03em] [background-image:linear-gradient(100deg,#2997ff_10%,#9d8cff_90%)]">
        {figure.value}
      </span>
      <span className="mt-2 block text-[14px] text-fog">
        {figure.label}
        <a href="#footnote-1" className="ml-0.5 align-super text-[10px] text-fog hover:text-mist" aria-label="Footnote 1">
          1
        </a>
      </span>
    </p>
  );
}

function Tile({ p, index }: { p: Project; index: number }) {
  const wide = p.size === "wide";
  const heading = (
    <>
      <p className="text-[17px] font-semibold tracking-[-0.016em] text-silver">{p.kicker}</p>
      <h3 className="type-card mt-2 max-w-[18ch] text-mist">{p.title}</h3>
    </>
  );
  const body = (
    <>
      <p className="text-[17px] leading-[1.47] text-fog">{p.summary}</p>
      <p className="mt-4 text-[17px] leading-[1.47] text-mist">{p.why}</p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6">
        {p.stack && <p className="type-small text-silver">{p.stack.join(", ")}</p>}
        <ChevronLink href={p.href} external tone="dark" className="text-[17px]">
          View on GitHub
        </ChevronLink>
      </div>
    </>
  );

  return (
    <Reveal as="article" delay={(index % 2) * 0.08} className={cn("flex flex-col overflow-hidden rounded-[28px] bg-carbon", span[p.size])}>
      {wide ? (
        // Wide tiles: title and figure on the left, the words on the right, the drawing across the bottom.
        <div className="grid gap-x-10 gap-y-4 p-8 md:p-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            {heading}
            {p.figure && <Figure figure={p.figure} />}
          </div>
          <div className="lg:pt-1">{body}</div>
        </div>
      ) : (
        <div className="p-8 md:p-10">
          {heading}
          <div className="mt-4">{body}</div>
          {p.figure && <Figure figure={p.figure} />}
        </div>
      )}
      <Stage visual={p.visual} className={cn("mt-auto aspect-[4/3] w-full self-center px-4 pb-6", wide ? "max-w-[680px]" : "max-w-[560px]")} />
    </Reveal>
  );
}

export function Projects() {
  return (
    <section id="projects" aria-labelledby="projects-title" className="bg-night py-24 text-mist md:py-32">
      <Reveal className="mx-auto max-w-[1180px] px-gutter">
        <h2 id="projects-title" className="type-headline">
          The work.
        </h2>
        <p className="type-intro mt-5 max-w-[46ch] text-fog">
          Eight projects, starting with the ones closest to quality and data work.
          <a href="#footnote-2" className="ml-0.5 align-super text-[12px] hover:text-mist" aria-label="Footnote 2">
            2
          </a>
        </p>
      </Reveal>
      <div className="mx-auto mt-12 grid max-w-[1180px] gap-5 px-gutter md:grid-cols-6">
        {projects.map((p, i) => (
          <Tile key={p.slug} p={p} index={i} />
        ))}
      </div>
    </section>
  );
}

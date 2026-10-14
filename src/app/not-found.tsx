import { TextLink } from "@/components/ui/links";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-[1080px] px-gutter py-24 outline-none md:py-32">
      <h1 className="type-section text-ink">This page can’t be found.</h1>
      <p className="mt-4 text-[17px] text-ash">The address may be mistyped, or the page may have moved.</p>
      <TextLink href="/" className="mt-4 text-[17px]">
        Go to the home page
      </TextLink>
    </main>
  );
}

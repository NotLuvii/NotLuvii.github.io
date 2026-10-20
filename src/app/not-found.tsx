import { TextLink } from "@/components/ui/links";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-[1200px] px-gutter py-f89 outline-none md:py-f144">
      <h1 className="type-section text-text">This page can’t be found.</h1>
      <p className="type-lede mt-f21 text-text-2">The address may be mistyped, or the page may have moved.</p>
      <TextLink href="/" className="mt-f13 text-[17px]">
        Go to the home page
      </TextLink>
    </main>
  );
}

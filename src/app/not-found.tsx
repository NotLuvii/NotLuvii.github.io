import { TextLink } from "@/components/ui/links";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-[1200px] px-gutter py-28 outline-none md:py-40">
      <h1 className="type-section text-text">This page can’t be found.</h1>
      <p className="type-lede mt-5 text-text-2">The address may be mistyped, or the page may have moved.</p>
      <TextLink href="/" className="mt-4 text-[17px]">
        Go to the home page
      </TextLink>
    </main>
  );
}

import { ChevronLink } from "@/components/ui/links";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-white px-gutter text-center">
      <div>
        <h1 className="type-headline text-ink">This page can’t be found.</h1>
        <p className="mt-6 text-[17px]">
          <ChevronLink href="/">Go to the home page</ChevronLink>
        </p>
      </div>
    </main>
  );
}

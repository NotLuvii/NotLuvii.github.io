/**
 * True in the build that is hosted as a claude.ai artifact (see /artifact). That page has two rules
 * the normal site doesn't: it must be complete the moment it loads, with nothing waiting on scroll to
 * appear, and it can't hand out files, so the résumé download is left out there.
 */
export const ARTIFACT = process.env.NEXT_PUBLIC_ARTIFACT === "1";

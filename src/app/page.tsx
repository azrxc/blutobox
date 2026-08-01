import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

const features = [
  {
    title: "No account needed",
    description: "Drop a file and get a link in seconds. Sign up only if you want more.",
  },
  {
    title: "Private by default",
    description: "Password-protect links and set an expiry date on the Pro plan.",
  },
  {
    title: "Built to last",
    description: "Files stay up as long as they're used — no surprise deletions.",
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Upload. Share. Done.
        </h1>
        <p className="mt-4 max-w-lg text-base text-muted sm:text-lg">
          A fast, simple file host. No clutter, no bloat — just a link you can send anywhere.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/upload"
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85"
          >
            Upload a file
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-surface"
          >
            See pricing
          </Link>
        </div>

        {session?.user && (
          <div className="mt-10 flex items-center gap-3 text-sm text-muted">
            <span>
              Logged in as {session.user.email} · {session.user.planTier}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className="underline transition-colors hover:text-foreground">
                Log out
              </button>
            </form>
          </div>
        )}
      </section>

      <section className="border-t border-border/80">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}>
              <h2 className="text-sm font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold">Bluto Box</h1>
        <div className="flex gap-3">
          <Link href="/upload" className="rounded border px-4 py-2 text-sm">
            Upload a file
          </Link>
          <Link href="/pricing" className="rounded border px-4 py-2 text-sm">
            Pricing
          </Link>
        </div>
        {session?.user ? (
          <div className="space-y-3">
            <p className="text-sm text-neutral-500">
              Logged in as {session.user.email} ({session.user.planTier})
            </p>
            <Link href="/account" className="rounded border px-4 py-2 text-sm">
              My account
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className="rounded border px-4 py-2 text-sm">
                Log out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link href="/login" className="rounded bg-black text-white px-4 py-2 text-sm">
              Log in
            </Link>
            <Link href="/register" className="rounded border px-4 py-2 text-sm">
              Sign up
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCurrentPlanTier } from "@/lib/plan";
import { maxSavedCharactersFor } from "@/lib/limits";
import { generateDailyCharacter } from "@/lib/daily-character";
import { ANON_IDENTITY_COOKIE, ANON_IDENTITY_COOKIE_MAX_AGE, newAnonToken } from "@/lib/anon-identity";

export const maxDuration = 30;

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayUtc(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

type Identity = { type: "user"; userId: string } | { type: "anon"; token: string; isNew: boolean };

async function resolveIdentity(userId: string | undefined): Promise<Identity> {
  if (userId) return { type: "user", userId };

  const cookieStore = await cookies();
  const existing = cookieStore.get(ANON_IDENTITY_COOKIE)?.value;
  if (existing) return { type: "anon", token: existing, isNew: false };
  return { type: "anon", token: newAnonToken(), isNew: true };
}

function identityWhere(identity: Identity) {
  return identity.type === "user" ? { ownerId: identity.userId } : { anonToken: identity.token };
}

function setAnonCookie(res: NextResponse, identity: Identity) {
  if (identity.type === "anon" && identity.isNew) {
    res.cookies.set(ANON_IDENTITY_COOKIE, identity.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ANON_IDENTITY_COOKIE_MAX_AGE,
    });
  }
}

async function getOrCreateTodaysCharacter() {
  const date = todayUtc();
  const existing = await prisma.dailyCharacter.findUnique({ where: { date } });
  if (existing) return { ok: true as const, character: existing };

  const result = await generateDailyCharacter();
  if (!result.ok) return { ok: false as const, reason: result.reason };

  // Two concurrent first-visitors-of-the-day could both reach here - the unique
  // `date` constraint means only one create wins, so fall back to reading
  // whichever row actually landed instead of erroring.
  try {
    const character = await prisma.dailyCharacter.create({
      data: {
        date,
        name: result.name,
        tagline: result.tagline,
        description: result.description,
        traits: result.traits,
        portrait: result.portrait,
      },
    });
    return { ok: true as const, character };
  } catch {
    const raceWinner = await prisma.dailyCharacter.findUnique({ where: { date } });
    if (raceWinner) return { ok: true as const, character: raceWinner };
    return { ok: false as const, reason: "Couldn't save today's character" };
  }
}

export async function GET(req: Request) {
  const session = await auth();
  const identity = await resolveIdentity(session?.user?.id);
  const planTier = await getCurrentPlanTier(session?.user?.id);
  const maxSaved = maxSavedCharactersFor(planTier);
  const where = identityWhere(identity);

  const [todaysResult, streak, saved] = await Promise.all([
    getOrCreateTodaysCharacter(),
    prisma.characterStreak.findUnique({ where }),
    prisma.savedCharacter.findMany({ where, orderBy: { savedAt: "desc" } }),
  ]);

  if (!todaysResult.ok) {
    return NextResponse.json({ error: todaysResult.reason }, { status: 502 });
  }

  const res = NextResponse.json({
    today: todaysResult.character,
    claimedToday: streak?.lastClaimedDate === todayUtc(),
    currentStreak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
    saved,
    maxSaved,
  });
  setAnonCookie(res, identity);
  return res;
}

const bodySchema = z.discriminatedUnion("action", [z.object({ action: z.literal("claim") }), z.object({ action: z.literal("save") })]);

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const session = await auth();
  const identity = await resolveIdentity(session?.user?.id);
  const where = identityWhere(identity);
  const today = todayUtc();

  const todaysResult = await getOrCreateTodaysCharacter();
  if (!todaysResult.ok) return NextResponse.json({ error: todaysResult.reason }, { status: 502 });

  if (parsed.data.action === "claim") {
    const streak = await prisma.characterStreak.findUnique({ where });
    let currentStreak: number;
    if (streak?.lastClaimedDate === today) {
      currentStreak = streak.currentStreak;
    } else if (streak?.lastClaimedDate === yesterdayUtc()) {
      currentStreak = streak.currentStreak + 1;
    } else {
      currentStreak = 1;
    }
    const longestStreak = Math.max(currentStreak, streak?.longestStreak ?? 0);

    const updated = await prisma.characterStreak.upsert({
      where,
      create: {
        ...(identity.type === "user" ? { ownerId: identity.userId } : { anonToken: identity.token }),
        currentStreak,
        longestStreak,
        lastClaimedDate: today,
      },
      update: { currentStreak, longestStreak, lastClaimedDate: today },
    });

    const res = NextResponse.json({
      today: todaysResult.character,
      claimedToday: true,
      currentStreak: updated.currentStreak,
      longestStreak: updated.longestStreak,
    });
    setAnonCookie(res, identity);
    return res;
  }

  // save
  const planTier = await getCurrentPlanTier(session?.user?.id);
  const maxSaved = maxSavedCharactersFor(planTier);
  const savedCount = await prisma.savedCharacter.count({ where });
  if (savedCount >= maxSaved) {
    return NextResponse.json(
      { error: `You've reached your limit of ${maxSaved} saved characters. Delete one to save more.` },
      { status: 400 }
    );
  }

  const character = todaysResult.character;
  const saved = await prisma.savedCharacter.create({
    data: {
      ...(identity.type === "user" ? { ownerId: identity.userId } : { anonToken: identity.token }),
      name: character.name,
      tagline: character.tagline,
      description: character.description,
      traits: character.traits as string[],
      portrait: character.portrait,
      sourceDate: character.date,
    },
  });

  const res = NextResponse.json({ saved });
  setAnonCookie(res, identity);
  return res;
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing character id" }, { status: 400 });

  const session = await auth();
  const identity = await resolveIdentity(session?.user?.id);
  await prisma.savedCharacter.deleteMany({ where: { ...identityWhere(identity), id } });
  return NextResponse.json({ ok: true });
}

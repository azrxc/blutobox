import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getClientIp } from "@/lib/request-ip";
import { getCurrentPlanTier } from "@/lib/plan";
import { maxSavedCharactersFor, dailyCharacterChatLimitFor } from "@/lib/limits";
import { checkDailyQuota, consumeDailyQuota } from "@/lib/daily-quota";
import { generateDailyCharacter } from "@/lib/daily-character";
import { askCharacter } from "@/lib/character-chat";
import { recordGuess, getGuessStats } from "@/lib/character-stats";
import { ANON_IDENTITY_COOKIE, ANON_IDENTITY_COOKIE_MAX_AGE, newAnonToken } from "@/lib/anon-identity";

const CHAT_QUOTA_PREFIX = "character-chat";

function shuffledGuessOptions(traits: string[], decoyTraits: string[]): string[] {
  const options = [traits[0], ...decoyTraits.slice(0, 2)];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

export const maxDuration = 60; // text + image generation sequentially can take longer than a text-only call

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
        decoyTraits: result.decoyTraits,
        portrait: result.portrait,
        portraitImageUrl: result.portraitImageUrl,
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
  const chatLimit = dailyCharacterChatLimitFor(planTier);
  const chatIdentifier = session?.user?.id ?? `ip:${getClientIp(req)}`;
  const where = identityWhere(identity);
  const today = todayUtc();

  const [todaysResult, streak, saved, chatQuota] = await Promise.all([
    getOrCreateTodaysCharacter(),
    prisma.characterStreak.findUnique({ where }),
    prisma.savedCharacter.findMany({ where, orderBy: { savedAt: "desc" } }),
    checkDailyQuota(CHAT_QUOTA_PREFIX, chatIdentifier, chatLimit),
  ]);

  if (!todaysResult.ok) {
    return NextResponse.json({ error: todaysResult.reason }, { status: 502 });
  }

  const guessedToday = streak?.lastGuessDate === today;
  const traits = todaysResult.character.traits as string[];
  const decoyTraits = todaysResult.character.decoyTraits as string[];

  // Portrait art is a Pro perk, not a free giveaway - it's still only generated
  // once per day site-wide (same cost either way), but only Pro viewers actually
  // see it. Free/anon get a locked hint instead of nothing, as an upgrade nudge.
  const isPro = planTier === "PRO";
  const hasImage = Boolean(todaysResult.character.portraitImageUrl);
  const todayForResponse = {
    ...todaysResult.character,
    portraitImageUrl: isPro ? todaysResult.character.portraitImageUrl : null,
  };

  const res = NextResponse.json({
    today: todayForResponse,
    imageLockedForFreeTier: hasImage && !isPro,
    claimedToday: streak?.lastClaimedDate === today,
    currentStreak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
    reminderOptIn: streak?.reminderOptIn ?? false,
    canSetReminder: identity.type === "user",
    saved,
    maxSaved,
    guessedToday,
    guessCorrect: guessedToday ? streak?.lastGuessCorrect ?? null : null,
    guessOptions: guessedToday ? null : shuffledGuessOptions(traits, decoyTraits),
    guessStats: guessedToday ? await getGuessStats(today) : null,
    chatUsed: chatQuota.used,
    chatLimit,
  });
  setAnonCookie(res, identity);
  return res;
}

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("claim") }),
  z.object({ action: z.literal("save") }),
  z.object({ action: z.literal("guess"), choice: z.string().min(1) }),
  z.object({ action: z.literal("chat"), question: z.string().min(1).max(200) }),
  z.object({ action: z.literal("reminder-opt-in"), optIn: z.boolean() }),
]);

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

  if (parsed.data.action === "reminder-opt-in") {
    if (identity.type !== "user") {
      return NextResponse.json({ error: "Log in to turn on streak reminders" }, { status: 400 });
    }
    await prisma.characterStreak.upsert({
      where,
      create: { ownerId: identity.userId, reminderOptIn: parsed.data.optIn },
      update: { reminderOptIn: parsed.data.optIn },
    });
    return NextResponse.json({ reminderOptIn: parsed.data.optIn });
  }

  if (parsed.data.action === "guess") {
    const streak = await prisma.characterStreak.findUnique({ where });
    if (streak?.lastGuessDate === today) {
      return NextResponse.json({ error: "You've already guessed today" }, { status: 400 });
    }

    const traits = todaysResult.character.traits as string[];
    const correct = parsed.data.choice === traits[0];

    await Promise.all([
      prisma.characterStreak.upsert({
        where,
        create: {
          ...(identity.type === "user" ? { ownerId: identity.userId } : { anonToken: identity.token }),
          lastGuessDate: today,
          lastGuessCorrect: correct,
        },
        update: { lastGuessDate: today, lastGuessCorrect: correct },
      }),
      recordGuess(today, correct),
    ]);

    const res = NextResponse.json({ correct, guessStats: await getGuessStats(today) });
    setAnonCookie(res, identity);
    return res;
  }

  if (parsed.data.action === "chat") {
    const planTier = await getCurrentPlanTier(session?.user?.id);
    const chatLimit = dailyCharacterChatLimitFor(planTier);
    const chatIdentifier = session?.user?.id ?? `ip:${getClientIp(req)}`;

    const { allowed, used: usedBefore } = await checkDailyQuota(CHAT_QUOTA_PREFIX, chatIdentifier, chatLimit);
    if (!allowed) {
      return NextResponse.json({ error: "Daily question limit reached. Come back tomorrow." }, { status: 429 });
    }
    await consumeDailyQuota(CHAT_QUOTA_PREFIX, chatIdentifier);

    const character = todaysResult.character;
    const result = await askCharacter(
      { name: character.name, tagline: character.tagline, description: character.description, traits: character.traits as string[] },
      parsed.data.question
    );
    if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 502 });

    const res = NextResponse.json({ answer: result.answer, chatUsed: usedBefore + 1, chatLimit });
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
      // Portrait art is Pro-only (see the GET handler) - don't let Free/anon save
      // their way to the image by saving the character instead of just viewing it.
      portraitImageUrl: planTier === "PRO" ? character.portraitImageUrl : null,
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

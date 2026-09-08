import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateDailyTrivia, type TriviaQuestion } from "@/lib/daily-trivia";
import { recordTriviaScore, getTriviaStats } from "@/lib/trivia-stats";
import { ANON_IDENTITY_COOKIE, ANON_IDENTITY_COOKIE_MAX_AGE, newAnonToken } from "@/lib/anon-identity";

export const maxDuration = 60;

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

function questionsWithoutAnswers(questions: TriviaQuestion[]) {
  return questions.map(({ question, options, category }) => ({ question, options, category }));
}

async function getOrCreateTodaysTrivia() {
  const date = todayUtc();
  const existing = await prisma.dailyTrivia.findUnique({ where: { date } });
  if (existing) return { ok: true as const, trivia: existing };

  const result = await generateDailyTrivia();
  if (!result.ok) return { ok: false as const, reason: result.reason };

  try {
    const trivia = await prisma.dailyTrivia.create({ data: { date, questions: result.questions } });
    return { ok: true as const, trivia };
  } catch {
    const raceWinner = await prisma.dailyTrivia.findUnique({ where: { date } });
    if (raceWinner) return { ok: true as const, trivia: raceWinner };
    return { ok: false as const, reason: "Couldn't save today's trivia" };
  }
}

export async function GET() {
  const session = await auth();
  const identity = await resolveIdentity(session?.user?.id);
  const where = identityWhere(identity);
  const today = todayUtc();

  const [todaysResult, streak] = await Promise.all([
    getOrCreateTodaysTrivia(),
    prisma.triviaStreak.findUnique({ where }),
  ]);

  if (!todaysResult.ok) {
    return NextResponse.json({ error: todaysResult.reason }, { status: 502 });
  }

  const playedToday = streak?.lastPlayedDate === today;
  const questions = todaysResult.trivia.questions as unknown as TriviaQuestion[];

  const res = NextResponse.json({
    playedToday,
    questions: playedToday ? questions : questionsWithoutAnswers(questions),
    correctIndices: playedToday ? questions.map((q) => q.correctIndex) : null,
    yourAnswers: playedToday ? streak?.lastAnswers ?? null : null,
    score: playedToday ? streak?.lastScore ?? null : null,
    total: questions.length,
    currentStreak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
    communityStats: playedToday ? await getTriviaStats(today) : null,
  });
  setAnonCookie(res, identity);
  return res;
}

const bodySchema = z.object({
  action: z.literal("submit"),
  answers: z.array(z.number().int().min(0).max(3)).min(1).max(10),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const session = await auth();
  const identity = await resolveIdentity(session?.user?.id);
  const where = identityWhere(identity);
  const today = todayUtc();

  const streak = await prisma.triviaStreak.findUnique({ where });
  if (streak?.lastPlayedDate === today) {
    return NextResponse.json({ error: "You've already played today's trivia" }, { status: 400 });
  }

  const todaysResult = await getOrCreateTodaysTrivia();
  if (!todaysResult.ok) return NextResponse.json({ error: todaysResult.reason }, { status: 502 });

  const questions = todaysResult.trivia.questions as unknown as TriviaQuestion[];
  if (parsed.data.answers.length !== questions.length) {
    return NextResponse.json({ error: "Answer count doesn't match today's quiz" }, { status: 400 });
  }

  const score = parsed.data.answers.reduce(
    (total, answer, i) => total + (answer === questions[i].correctIndex ? 1 : 0),
    0
  );

  let currentStreak: number;
  if (streak?.lastPlayedDate === yesterdayUtc()) {
    currentStreak = streak.currentStreak + 1;
  } else {
    currentStreak = 1;
  }
  const longestStreak = Math.max(currentStreak, streak?.longestStreak ?? 0);

  const [updated] = await Promise.all([
    prisma.triviaStreak.upsert({
      where,
      create: {
        ...(identity.type === "user" ? { ownerId: identity.userId } : { anonToken: identity.token }),
        currentStreak,
        longestStreak,
        lastPlayedDate: today,
        lastScore: score,
        lastAnswers: parsed.data.answers,
      },
      update: {
        currentStreak,
        longestStreak,
        lastPlayedDate: today,
        lastScore: score,
        lastAnswers: parsed.data.answers,
      },
    }),
    recordTriviaScore(today, score),
  ]);

  const res = NextResponse.json({
    score,
    total: questions.length,
    correctIndices: questions.map((q) => q.correctIndex),
    currentStreak: updated.currentStreak,
    longestStreak: updated.longestStreak,
    communityStats: await getTriviaStats(today),
  });
  setAnonCookie(res, identity);
  return res;
}

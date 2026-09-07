import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getClientIp } from "@/lib/request-ip";
import { getCurrentPlanTier } from "@/lib/plan";
import { dailyAdventureTurnLimitFor } from "@/lib/limits";
import { checkDailyQuota, consumeDailyQuota } from "@/lib/daily-quota";
import { startAdventure, continueAdventure, STAT_MIN, STAT_MAX, type Turn, type StatGoal } from "@/lib/adventure";
import { ADVENTURE_ANON_COOKIE, ADVENTURE_ANON_COOKIE_MAX_AGE, newAnonToken } from "@/lib/adventure-session";

export const maxDuration = 30;

const QUOTA_PREFIX = "adventure";

type Identity = { type: "user"; userId: string } | { type: "anon"; token: string; isNew: boolean };

async function resolveIdentity(userId: string | undefined): Promise<Identity> {
  if (userId) return { type: "user", userId };

  const cookieStore = await cookies();
  const existing = cookieStore.get(ADVENTURE_ANON_COOKIE)?.value;
  if (existing) return { type: "anon", token: existing, isNew: false };
  return { type: "anon", token: newAnonToken(), isNew: true };
}

function adventureWhere(identity: Identity) {
  return identity.type === "user" ? { ownerId: identity.userId } : { anonToken: identity.token };
}

function setAnonCookie(res: NextResponse, identity: Identity) {
  if (identity.type === "anon" && identity.isNew) {
    res.cookies.set(ADVENTURE_ANON_COOKIE, identity.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADVENTURE_ANON_COOKIE_MAX_AGE,
    });
  }
}

export async function GET(req: Request) {
  const session = await auth();
  const identity = await resolveIdentity(session?.user?.id);
  const planTier = await getCurrentPlanTier(session?.user?.id);
  const quotaIdentifier = session?.user?.id ?? `ip:${getClientIp(req)}`;
  const limit = dailyAdventureTurnLimitFor(planTier);

  const [adventure, { used }] = await Promise.all([
    prisma.adventure.findUnique({ where: adventureWhere(identity) }),
    checkDailyQuota(QUOTA_PREFIX, quotaIdentifier, limit),
  ]);

  const res = NextResponse.json({ adventure, used, limit });
  setAnonCookie(res, identity);
  return res;
}

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start"), scenario: z.string().min(1).max(300) }),
  z.object({ action: z.literal("continue"), message: z.string().min(1).max(500) }),
]);

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const session = await auth();
  const identity = await resolveIdentity(session?.user?.id);
  const planTier = await getCurrentPlanTier(session?.user?.id);
  // Anon quota is IP-based, same convention as every other anon quota in the app
  // (download, upload, AI summary) - separate from the adventure cookie, which only
  // identifies which story session this browser owns, not how many turns it gets.
  const quotaIdentifier = session?.user?.id ?? `ip:${getClientIp(req)}`;
  const limit = dailyAdventureTurnLimitFor(planTier);

  const { allowed, used: usedBefore } = await checkDailyQuota(QUOTA_PREFIX, quotaIdentifier, limit);
  if (!allowed) {
    return NextResponse.json({ error: "Daily adventure limit reached. Come back tomorrow." }, { status: 429 });
  }
  await consumeDailyQuota(QUOTA_PREFIX, quotaIdentifier);
  const used = usedBefore + 1;

  const where = adventureWhere(identity);

  if (parsed.data.action === "start") {
    const result = await startAdventure(parsed.data.scenario);
    if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 502 });

    const turns: Turn[] = [
      { role: "narrator", content: result.narrative, choices: result.choices, critical: result.critical },
    ];
    await prisma.adventure.deleteMany({ where });
    const adventure = await prisma.adventure.create({
      data: {
        ...(identity.type === "user" ? { ownerId: identity.userId } : { anonToken: identity.token }),
        scenario: parsed.data.scenario,
        turns,
        turnCount: 1,
        statLabel: result.statLabel,
        statGoal: result.statGoal,
      },
    });

    const res = NextResponse.json({ adventure, used, limit });
    setAnonCookie(res, identity);
    return res;
  }

  const existing = await prisma.adventure.findUnique({ where });
  if (!existing) {
    return NextResponse.json({ error: "No adventure in progress" }, { status: 404 });
  }
  if (existing.ended) {
    return NextResponse.json({ error: "This story has ended - start a new adventure" }, { status: 400 });
  }

  const priorTurns = existing.turns as unknown as Turn[];
  const statLabel = existing.statLabel ?? "Progress";
  const statGoal = existing.statGoal as StatGoal;
  const result = await continueAdventure(priorTurns, parsed.data.message, statLabel, existing.statValue, statGoal);
  if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 502 });

  const statValue = Math.max(STAT_MIN, Math.min(STAT_MAX, existing.statValue + result.statDelta));
  const ended = statValue <= STAT_MIN || statValue >= STAT_MAX;
  const won = ended && (statGoal === "high" ? statValue >= STAT_MAX : statValue <= STAT_MIN);

  const turns: Turn[] = [
    ...priorTurns,
    { role: "player", content: parsed.data.message.trim() },
    {
      role: "narrator",
      content: result.narrative,
      choices: ended ? undefined : result.choices,
      critical: ended ? undefined : result.critical,
    },
  ];
  const adventure = await prisma.adventure.update({
    where,
    data: { turns, turnCount: { increment: 1 }, lastPlayedAt: new Date(), statValue, ended, won },
  });

  const res = NextResponse.json({ adventure, used, limit });
  setAnonCookie(res, identity);
  return res;
}

export async function DELETE() {
  const session = await auth();
  const identity = await resolveIdentity(session?.user?.id);
  await prisma.adventure.deleteMany({ where: adventureWhere(identity) });
  return NextResponse.json({ ok: true });
}

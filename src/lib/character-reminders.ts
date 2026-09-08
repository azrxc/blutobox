import { prisma } from "@/lib/prisma";
import { sendStreakReminderEmail } from "@/lib/email";

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayUtc(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Finds logged-in users who opted in, claimed yesterday, and haven't claimed today yet -
// their streak breaks if they don't act today, so this is the one moment a reminder
// actually matters. Runs once a day from the same cron as file cleanup (src/app/api/cron/cleanup/route.ts)
// rather than a second Vercel cron job, since Hobby plans cap how many you can register.
export async function sendStreakReminders() {
  const today = todayUtc();
  const yesterday = yesterdayUtc();

  const atRisk = await prisma.characterStreak.findMany({
    where: {
      reminderOptIn: true,
      ownerId: { not: null },
      currentStreak: { gt: 0 },
      lastClaimedDate: yesterday,
      NOT: { lastReminderSentDate: today },
    },
    include: { owner: true },
  });

  let sent = 0;
  for (const streak of atRisk) {
    if (!streak.owner) continue;
    try {
      await sendStreakReminderEmail(streak.owner.email, streak.currentStreak);
    } catch (err) {
      console.error(`[character-reminders] Failed to send reminder to ${streak.owner.email}:`, err);
      continue;
    }
    await prisma.characterStreak.update({
      where: { id: streak.id },
      data: { lastReminderSentDate: today },
    });
    sent++;
  }

  return { sent };
}

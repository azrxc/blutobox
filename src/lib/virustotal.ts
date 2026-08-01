const MALICIOUS_THRESHOLD = 2;

export async function isKnownMalicious(sha256: string): Promise<boolean> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return false;

  try {
    const res = await fetch(`https://www.virustotal.com/api/v3/files/${sha256}`, {
      headers: { "x-apikey": apiKey },
    });

    if (res.status === 404) return false;
    if (!res.ok) return false;

    const data = await res.json();
    const malicious: number = data?.data?.attributes?.last_analysis_stats?.malicious ?? 0;
    return malicious >= MALICIOUS_THRESHOLD;
  } catch {
    return false;
  }
}

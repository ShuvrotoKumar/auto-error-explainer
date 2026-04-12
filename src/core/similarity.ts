// Small, dependency-free similarity score (0..1)

export function similarity(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  if (a === b) return 1;

  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : Math.max(0, 1 - dist / maxLen);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  const dp: number[] = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }

  return dp[n];
}
